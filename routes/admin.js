const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, [

    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim()
        .withMessage('Title must be a string and at least three characters long!'),

        body('imageUrl')
        .isURL()
        .trim()
        .withMessage('Image Url must be a valid url!'),
        
        body('price')
        .isFloat()
        .withMessage('Price must be a valid float!')  ,

        body('description')
        .isLength({ min: 8, max: 400})
        .withMessage('Description must be a valid string between eight and four hundred characters!') 

], adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, [

    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim()
        .withMessage('Title must be a string and at least three characters long!'),

        body('imageUrl')
        .isURL()
        .trim()
        .withMessage('Image Url must be a valid url!'),
        
        body('price')
        .isFloat()
        .withMessage('Price must be a valid float!')  ,

        body('description')
        .isLength({ min: 8, max: 400})
        .withMessage('Description must be a valid string between eight and four hundred characters!') 


], adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
