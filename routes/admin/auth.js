const express = require('express');

const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { requireEmail, 
  requirePassword, 
  requirePasswordConfirmation,
  requireEmailExists, 
  requireValidPasswordForUser} = require('./validators');

const router = express.Router();

// request response
router.get('/signup', (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post('/signup',  [
    requireEmail,
    requirePassword,
    requirePasswordConfirmation
  ],
  handleErrors(signupTemplate),
  async (req, res) => {
    console.log(req.body);

    const { email, password, passwordConfirmation } = req.body;


  // create user in user repo to represent person
  const user = await usersRepo.create({ email, password });

  // store id of user in users cookie
  req.session.userId = user.id

  res.redirect('/admin/products');
});

router.get('/signout', (req, res) => {
  req.session = null;
  res.send('you are logged out')
});

router.get('/signin', (req, res) => {
  res.send(signinTemplate({}));
});

router.post('/signin', 
  [requireEmailExists,
  requireValidPasswordForUser], 
  handleErrors(signinTemplate),
  async (req, res) => {
    const { email } = req.body;

    const user = await usersRepo.getOneBy({email});

    req.session.userId = user.id;
    res.redirect('/admin/products');
});

module.exports = router;