const Product = require('../models/product');

const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.user,
    validationErrors: [],
    errorMessage: req.flash('error'),
    hasError: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      isAuthenticated: req.session.user,
      errorMessage: errors.array()[0].msg,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      validationErrors: errors.array()
    });

  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.session.user
  });

  product.save()
  .then(result => {
    console.log(result);
    res.redirect('/admin/products');
  }).catch(err => console.log(err))
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      isAuthenticated: req.session.user,
      validationErrors: [],
      hasError: false,
      errorMessage: req.flash('error')
    });
  }).catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: false,
      isAuthenticated: req.session.user,
      errorMessage: errors.array()[0].msg,
      hasError: true,
      product: {
        prodId: prodId,
        title:  updatedTitle,
        price: updatedPrice,
        imageUrl: updatedImageUrl,
        description:  updatedDesc,
        _id: prodId
      },
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId).then(product => {

    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDesc;
   return product.save()
  })
  .then(
    result => {
      console.log('PRODUCT UPDATED SUCESSFULLY!!');
      res.redirect('/admin/products');
    }
  )
  .catch(err => console.log(err))
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    // .select('title price -_id') // Use to filter result
    // .populate('userId') //eagerload the relationship
    // .populate('userId', 'name -_id') //eagerload the relationship with filter
    .then(products => {
      console.log('products',products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.user
      });
    }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findByIdAndRemove(prodId)
  Product.deleteOne({ _id: prodId, userId: req.user._id })
  .then(
    result => {
      console.log('PRODUCT DELETED SUCESSFULLY!!');
      res.redirect('/admin/products');
    }
  )
  .catch(err => console.log(err));
};
