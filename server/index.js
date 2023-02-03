import http from 'http';
import https from 'https';
import path from 'path';
import fs from 'fs';
import io from 'socket.io';

import { validateUserSuppliedCoords } from './utils';

import middleWare from './middleware';
import indexRoute from './routes';
import gameRoute from './routes/game';
import merchantRoute from './routes/merchant';

const getSocketInstance = () => socketIO;

const app = middleWare(getSocketInstance);

app.use('/', indexRoute(getSocketInstance));
app.use('/game', gameRoute);
app.use('/merchant', merchantRoute(getSocketInstance));

app.all('/logout', (req, res, next) => {
  req.app.locals = {};
  req.cookies.rrjwt = null;
  res.redirect(301, '/');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Get port from environment and store in Express.
 */

const port = (process.env.PORT || 3000);
const securePort = (process.env.SECURE_PORT || 3443);

const onListen = () => {
  if (process.env.NODE_ENV === 'development') 
    console.log('https://localhost:3443');
}

let cert = path.join('/', 'etc', 'letsencrypt', 'live', 'vikingstamp.com', 'cert.pem');
let key = path.join('/', 'etc', 'letsencrypt', 'live', 'vikingstamp.com', 'privkey.pem');

if (process.env.NODE_ENV === 'development') {
  cert = path.join('./', 'creds', 'https.crt');
  key = path.join('./', 'creds', 'https.key');
} 

const options = {
  cert: fs.readFileSync(cert),
  key: fs.readFileSync(key)
}

const httpsCreated = https.createServer(options, app);
const httpCreated = http.createServer(app);

const socketIO = io(httpsCreated);

socketIO.on('connection', socket => {
  
  socket.on('hover event', message => {
    const values = Object.values(message);
    const isValid = validateUserSuppliedCoords(values);
    if (isValid) {
      socket.broadcast.emit('hover event', { game_id: process.env.CURRENT_GAME_ID, message });
    }
  });
  
});

httpsCreated.listen(securePort, onListen);
httpCreated.listen(port, onListen);