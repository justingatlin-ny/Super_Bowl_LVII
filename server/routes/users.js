import express from 'express';
import * as db from './db';

export default (socketInstance) => {
  const { getUser, insertUser } = db(socketInstance);
  
  const router = express.Router();

  /* GET users listing. */
  router.get('/:id',
    (req, res, next) => {
      next();
    },
    getUser
  );

  router.post('/newuser', function(req, res, next) {
    const { body } = req;
    res.status(200).send(JSON.stringify(body));
  });

  router.delete('/', function(req, res, next) {
    res.send('respond with a resource');
  });

  router.patch('/', function(req, res, next) {
    res.send('respond with a resource');
  });

  router.put('/', function(req, res, next) {
    res.send('respond with a resource');
  });

  router.all('*', (req, res) => {
    res.sendStatus(404);
  })

  return router;
}
