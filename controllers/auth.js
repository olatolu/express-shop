const User = require('../models/user');
const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');

const mg = require('nodemailer-mailgun-transport');

const { validationResult } = require('express-validator');

const crypto = require('crypto');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
  auth: {
    api_key: '767901f44b51835a6d3551a195dd7193-81bd92f8-81859db1',//'381939fbcb3e251b722f0164038e5715-64574a68-98fced03',//'767901f44b51835a6d3551a195dd7193-81bd92f8-81859db1',
    domain: 'mg.classnotes.com.ng'
  },
  host: 'api.eu.mailgun.net'
}

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error'),
    oldInput: {},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

// exports.postLogin = (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   User.findOne({ email: email })
//     .then(user => {
//       if (!user) {
//         req.flash('error', 'Invalid Username or Password!')
//         return res.redirect('/login');
//       }
//       bcrypt
//         .compare(password, user.password)
//         .then(doMatch => {
//           if (doMatch) {
//             req.session.isLoggedIn = true;
//             req.session.user = user;
//             return req.session.save(err => {
//               console.log(err);
//               res.redirect('/');
//             });
//           }
//           req.flash('error', 'Invalid Username or Password!')
//           res.redirect('/login');
//         })
//         .catch(err => {
//           console.log(err);
//           res.redirect('/login');
//         });
//     })
//     .catch(err => console.log(err));
// };

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage:  req.flash('error'),
    oldInputs: {},
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmassword = req.body.confirmPassword;

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log('SignUpErr', errors.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage:  errors.array()[0].msg,
      oldInputs: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  bcrypt.hash(password, 12)
    .then(hashPassword => {
      const user = new User({
        email: email,
        password: hashPassword,
        cart:  { items: []}
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      nodemailerMailgun.sendMail({
        from: 'mailer@expresspshop.net',
        to: email, // An array if you have multiple recipients.
        subject: 'SignUp Success New',
        'replyTo': email,
        html: '<h2>You have successfuly Signup!</h2>'
      })
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getResetPassword = (req, res, next) => {
  res.render('auth/reset-password', {
    path: '/reset-password',
    pageTitle: 'Reset Password',
    errorMessage: req.flash('error')
  });
}


exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
      if(err){
        console.log('crypto', err);
        req.flash('error', 'Something went wrong!, Please try again later.')
        return res.redirect('/reset-password');
      }
      const token = buffer.toString('hex');
      // console.log('token', token);
      // console.log('req.body.email', req.body.email);
      User.findOne({email: req.body.email})
      .then(user => {
        if(!user){
        req.flash('error', 'There was no account with the email!')
        return res.redirect('/reset-password');        
        }
        user.resetPasswordToken = token;
        user.resetPasswordTokenExpiration = Date.now() + 900000;
        return user.save();
      })
      .then(result => {
        console.log('result', result);
        res.redirect('/');
        nodemailerMailgun.sendMail({
          from: 'mailer@expresspshop.net',
          to: result.email, // An array if you have multiple recipients.
          subject: 'Reset Password',
          'replyTo': result.email,
          html: `
          <p>You Have Request for a Password Reset</p>
          <p>Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your password</p>
          `
        });
      })
      .catch(err => console.log('postResetPassword', err));

  })

}

exports.getNewPassword = (req, res, next) => {

  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordTokenExpiration: {$gt: Date.now()}
  })
  .then(user => {

    if(!user){
      req.flash('error', 'Reset link is invalid!');
      return res.redirect('/reset-password');
    }

    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'Reset Password | New Password',
      userId: user._id,
      passwordToken: req.params.token, 
      errorMessage: req.flash('error')
    });

  })
  .catch(err => console.log(err))

}


exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetPasswordToken: passwordToken,
    resetPasswordTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      if(!user){
        req.flash('error', 'Something went wrong!');
        return res.redirect('/reset-password');
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetPasswordToken = undefined;
      resetUser.resetPasswordTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};
