import axios from 'axios';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

export default (socketInstance) => {
      const isDev = (process.env.NODE_ENV === 'development');
      const app = express();

      app.enable("trust proxy");

      app.use(helmet({
        contentSecurityPolicy: false,
      }));
      
      // view engine setup
      app.set('view engine', 'ejs');
      app.set('views', path.join('./', 'views'));

      const cookieSecret = process.env.COOKIE_SECRET;

      app.use(cookieParser(cookieSecret));

      app.use((req, res, next) => {
          const { uuid } = req.signedCookies;
          if (!uuid) {
              const oneYear = ((60 * 60 * 1000 * 24) * 365);
              res.cookie('uuid', uuidv4(), {
              expires: new Date(Date.now() + oneYear),
              signed: true,
              httpOnly: true,
              secret: cookieSecret,
              secure: true
              });
          }
          next();
      });

      morgan.token('uuid', function getId (req) {
          const { uuid } = req.signedCookies;
          return uuid;
      });

      app.use(express.static(path.join('./htdocs', 'public')));

      // create a write stream (in append mode)
      const dir = './logs';
      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
      }

      const accessLogStream = fs.createWriteStream(path.join('./logs', 'access.log'), { flags: 'a' })
      
      app.use(morgan((tokens, req, res) => {
          return JSON.stringify({
              method: tokens.method(req, res),
              uuid: tokens.uuid(req, res),
              referrer: tokens.referrer(req, res),
              remoteAddr: tokens['remote-addr'](req, res),
              url: tokens.url(req, res),
              userAgent: tokens['user-agent'](req, res),
              date: tokens.date(req, res, '[web]')
          })
          },
          { stream: accessLogStream })
      );

      app.use(bodyParser.urlencoded({ extended: false }))
      app.use(bodyParser.json())
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      
      app.use((req, res, next) => {
        const { amazon_Login_accessToken } = req.cookies;
      
        if (amazon_Login_accessToken) {
          res.locals.access_token = amazon_Login_accessToken;
        }
        next();
      });
        
      app.use((req, res, next) => {
        const { access_token } = res.locals;
        
        res.locals.user_id = null;

        if (!access_token) return next();

        axios({
          url: process.env.AWS_USER_PROFILE_URL,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          }
        })
        .then(response => {

          const { user_id } = response.data;

          if (!user_id) throw 'No user_id';
          
          res.locals.user_id = user_id;
        })
        .catch(err => {
          if (err.response) {
              // console.error('request error', err.response.data);
          } else {
              // console.error('response error', err);
          }
        })
        .finally(() => {
          next();
        })
      
      });
      
      return app;
}