import '@babel/polyfill';
import axios from 'axios';
import xpath from 'xpath';
import xmldom from 'xmldom';
import { verify } from './security';
import { validateUserSuppliedCoords } from '../utils';
import db from './db';
import express from 'express';
import _ManageParams from './ManageParams';

export default (socketInstance) => {
  const { insertTransaction, commitTransaction, getOrAddUser, emitSquares } = db(socketInstance);

  const router = express.Router();
  const isDev = (process.env.NODE_ENV === 'development');
  router.use(verify);
  router.use(getOrAddUser);

  const getRelevantData = (response) => {
    const dom = xmldom.DOMParser;
    const doc = new dom().parseFromString(response.data);
    const ns = /xmlns="(.+)">/.exec(doc)[1];
    const select = xpath.useNamespaces({ "awsml": ns });
    const name = select("string(//awsml:Name)", doc);
    const email = select("string(//awsml:Email)", doc);
    const AmazonAuthorizationId = select("string(//awsml:AmazonAuthorizationId)", doc);
    return { name, email, AmazonAuthorizationId };
  }

  const getErrorData = (err) => {
    if (!err || !err.response) {
      return { code: 'Unknown Error', message: err && err.message || 'Undetermined Error Occured' };
    }

    const dom = xmldom.DOMParser;
    const doc = new dom().parseFromString(err.response.data);
    const ns = /xmlns="(.+)">/.exec(doc);
    const select = xpath.useNamespaces({ "awsml": ns[1] });
    const code = select("string(//awsml:Code)", doc);
    const message = select("string(//awsml:Message)", doc);

    // console.error(`AWS Transaction Error\nCode: ${code}\nMessage: ${message}`);

    return { code, message };
  }

  const makeAttempt = (data) => {
    const headers = {
      'content-type': 'application/x-www-form-urlencoded'
    }
    const url = process.env.AWS_PAYMENT_URL;

    return axios({
      method: 'POST',
      url,
      headers,
      data,
      responseType: 'xml'
    })
  }

  const validateCoords = (req, res, next) => {

    // return res.status(401).send('Game has ended');

    const { orderReferenceId, coordsList } = req.body;
    const { uuid } = req.signedCookies;

    const isValid = validateUserSuppliedCoords(coordsList);
    if (isValid) return next();
    console.error('User manipulated data', coordsList, orderReferenceId, uuid);
    res.status(417).send('Invalid data received.');
  }

  const setOrderReference = (req, res, next) => {
    const { orderReferenceId, coordsList } = req.body;

    const SellerOrderId = `rr-${Date.now()}`;
    const price = process.env.PRICE;
    const amount = coordsList.length * price;
    const coordsStr = coordsList.join(', ');

    const receiptNote = `"Super Bowl LV Fundraiser: Space${coordsList.length > 1 ? 's' : ''} Purchased: ${coordsStr}`;

    const dynamicParams = [
      ["Action", 'SetOrderAttributes'],
      ["OrderAttributes.OrderTotal.Amount", amount],
      ["OrderAttributes.OrderTotal.CurrencyCode", 'USD'],
      ["OrderAttributes.SellerOrderAttributes.StoreName", "Rogers Reunion - Dallas"],
      ["OrderAttributes.SellerOrderAttributes.SellerOrderId", SellerOrderId],
      ["OrderAttributes.SellerNote", receiptNote],
      ["AmazonOrderReferenceId", orderReferenceId]
    ];

    res.locals.ManageParams = new _ManageParams(orderReferenceId, SellerOrderId);
    res.locals.ManageParams.makeSignature(dynamicParams);
    res.locals.amount = amount;
    res.locals.receiptNote = receiptNote;
    res.locals.route = 'setOrderReference';
    next();
  }

  const confirm = (req, res, next) => {

    const { orderReferenceId } = req.body;

    const dynamicParams = [
      ["Action", 'ConfirmOrderReference'],
      ["AmazonOrderReferenceId", orderReferenceId]
    ];
    res.locals.ManageParams.makeSignature(dynamicParams);
    res.locals.route = 'confirm';
    next();
  }

  const authorize = (req, res, next) => {

    const { orderReferenceId } = req.body;
    const { amount, receiptNote } = res.locals;

    const dynamicParams = [
      ["Action", 'Authorize'],
      ["AuthorizationAmount.Amount", amount],
      ["AuthorizationAmount.CurrencyCode", 'USD'],
      ["AmazonOrderReferenceId", orderReferenceId],
      ["CaptureNow", "false"],
      ["AuthorizationReferenceId", "Auth_Ref_" + Date.now()],
      ["SellerAuthorizationNote", receiptNote]
    ];

    res.locals.ManageParams.makeSignature(dynamicParams);
    res.locals.route = 'authorize';
    next();

  }

  const getOrderDetails = (req, res, next) => {
    const { orderReferenceId } = req.body;
    const dynamicParams = [
      ["Action", 'GetOrderReferenceDetails'],
      ["AmazonOrderReferenceId", orderReferenceId]
    ];

    res.locals.ManageParams.makeSignature(dynamicParams);
    res.locals.route = 'getOrderDetails';
    next();
  }

  const capture = (req, res, next) => {

    const { orderReferenceId } = req.body;
    const { amount, receiptNote, AmazonAuthorizationId } = res.locals;

    const dynamicParams = [
      ["Action", 'Capture'],
      ["AmazonAuthorizationId", AmazonAuthorizationId],
      ["CaptureAmount.Amount", amount],
      ["CaptureAmount.CurrencyCode", 'USD'],
      ["CaptureReferenceId", `rr_super_bowl_ref_${Date.now()}`],
      ["SellerCaptureNote", receiptNote],
      ["AmazonOrderReferenceId", orderReferenceId]
    ];

    res.locals.ManageParams.makeSignature(dynamicParams);
    res.locals.route = 'capture';
    next();

  }

  const cancelOrderReference = (req, res, next) => {
    const { orderReferenceId } = req.body;

    const dynamicParams = [
      ["Action", 'CancelOrderReference'],
      ["AmazonOrderReferenceId", orderReferenceId]
    ];

    res.locals.ManageParams.makeSignature(dynamicParams);
    res.locals.route = 'cancelOrderReference';
    next();
  }

  const send = (req, res, next) => {

    const { params, signature } = res.locals.ManageParams.purchaseInfo;

    const updatedParams = `${params}&Signature=${signature}`;

    if (isDev) {
      // console.log('route', res.locals.route);
    }

    makeAttempt(updatedParams)
      .then(response => {
        const { email, name, AmazonAuthorizationId } = getRelevantData(response) || {};
        if (AmazonAuthorizationId) {
          res.locals.AmazonAuthorizationId = AmazonAuthorizationId;
        }
        if (email && name) {
          res.locals.userInfo = {
            name,
            email
          }
        }
        res.locals.route = null;
        next();
      })
      .catch(err => {

        res.locals.connection.query('ROLLBACK');
        res.locals.connection.query('UNLOCK TABLES');
        res.locals.connection.release();

        let data = { message: 'Route Error', code: 'BrokenRoute' };
        if (err.response) {
          data = getErrorData(err);
        } else {
          data.message = err.message || data.message;
        }

        next(data);
      });
  }

  router.post('/confirm', validateCoords, insertTransaction, [setOrderReference, send], [confirm, send], [getOrderDetails, send], [authorize, send], [capture, send], commitTransaction, emitSquares);

  router.use((err, req, res, next) => {
    // console.error('/confirm error handler', err);
    const { message, code } = err || {};
    let userResponse = 'An error occured while processing your order. Please refresh the page and try again.';
    console.error('code', code);
    console.error('message', message);
    switch (code) {
      case 'InvalidAuthorizationStatus':
        userResponse = "Unfortunately, your card was declined.";
        break;
      case 'InvalidCancelAttempt':
        break
      case 'OrderReferenceNotModifiable':
        break;
      case 'InvalidAuthorizationStatus':
        userResponse = "Unfortunately, that payment method is not allowed.";
        break;
      case 'InvalidAuthorizationStatus':

        break;
      case 'InternalError':
        userResponse = 'Service temporarily unavailable. Please try again.';
        break;
      default:
    }
    if (message && code) {
      res.locals.vettedError = userResponse;
    }
    next();
  }, [cancelOrderReference, send], [getOrderDetails, send], (req, res, next) => {
    const { vettedError } = res.locals;

    res.status(400).send(vettedError);
  })

  router.use((err, req, res, next) => {
    const userError = res.locals.vettedError || 'An error occured. Please refresh the page and try again.';
    // console.error('Default Error Handler', err);
    res.status(500).send(userError);
  })

  return router;
}