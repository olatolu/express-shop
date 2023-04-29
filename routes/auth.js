const express = require('express');

const authController = require('../controllers/auth');

const { body } = require('express-validator');

const User = require('../models/user');


const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .custom((value, {req}) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (!userDoc) {
                    return Promise.reject(
                    'Invalid Username or Password!'
                    );
                }
            });
        }),

      body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
    ],
    authController.postLogin
  );

router.post('/signup', 

body('email').isEmail()
.withMessage('Please enter a valid email.')
.normalizeEmail()
.custom((value, {req}) => {
    // if (value === 'test@test.com') {
    //   throw new Error('This email address if forbidden.');
    // }
    // return true;
    return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
            return Promise.reject(
            'E-Mail exists already, please pick a different one.'
            );
        }
    });
}),

body('password', 'Please enter a number with only text and number and at least 5 characters long.')
.isLength({min: 5})
.trim()
.isAlphanumeric(),

body('confirmPassword')
.trim()
.custom((value, {req}) => {
    if(value !== req.body.password){
        throw new Error('Password does not match!');
    }
    return true;
}),

authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/reset-password/:token', authController.getNewPassword);

router.post('/reset-password/new-password', authController.postNewPassword);

module.exports = router;