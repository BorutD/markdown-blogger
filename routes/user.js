const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const initializePassport = require('../passport-config');
const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require('../middleware/middleware');

initializePassport(passport);

router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('userActions/login');
});

router.post(
  '/login',
  checkNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureFlash: true,
  })
);

router.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('userActions/register');
});

router.post(
  '/register',
  checkNotAuthenticated,
  (req, res, next) => {
    req.user = new User();
    next();
  },
  saveUserAndRedirect('/login')
);

router.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/settings', checkAuthenticated, (req, res) => {
  res.render('userActions/settings', { user: req.user });
});

router.put('/settings', checkAuthenticated, async (req, res) => {
  let newData = {};
  if (req.user.username != req.body.username && req.body.username != '') {
    newData.username = req.body.username;
  }
  if (req.user.email != req.body.email && req.body.email != '') {
    newData.email = req.body.email;
  }

  await User.updateOne({ username: req.user.username }, { $set: newData });

  res.redirect('/');
});

function saveUserAndRedirect(path) {
  return async (req, res) => {
    const hashedPassword = await bcryptjs.hash(req.body.password, 10);
    let user = req.user;
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = hashedPassword;

    user = await user.save();

    res.redirect(path);
  };
}

module.exports = router;
