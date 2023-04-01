const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.user
  });
};


exports.postLogin = (req, res, next) => {

  User.findById('642600b0ad25c8487c9d71de')
  .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err => {
        console.log(err);
        res.redirect('/');
      })
    }
  )
  .catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {

  req.session.destroy(err => {
      console.log(err);
      res.redirect('/')
    });
};
