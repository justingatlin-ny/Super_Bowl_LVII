import express from 'express';
import db from './db';

import _ManageParams from './ManageParams';

export default (socketInstance) => {
  const router = express.Router();

  const { getPurchasedSquares, getOrAddUser } = db(socketInstance);

  router.use(getOrAddUser, getPurchasedSquares);

  router.get('/', async (req, res, next) => {
    const { initialSquares, id = '', user_id } = res.locals;

    const loggedIn = user_id ? true : false;

    const publicData = {
      title: 'Super Bowl Squares: Kansas City Chiefs vs Philadelphia Eagles',
      loggedIn,
      initialSquares,
      id,
      sellerId: process.env.AWS_SELLER_ID,
      clientId: process.env.AWS_CLIENT_ID,
      merchantId: process.env.AWS_MERCHANT_ID,
      applicationId: process.env.AWS_APPLICATION_ID,
      redirectURL: process.env.AWS_REDIRECT_URL,
      awsPayWidget: process.env.AWS_PAY_WIDGET
    }

    res.render('index', { publicData });
  });

  return router;
}
