import express from 'express';

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    const { email, id } = res.locals.decodedJWT.data;
    res.status(200).send({ email, id });
});

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

export default router;
