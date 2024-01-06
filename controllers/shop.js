const Product = require("../models/product");

const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const Order = require("../models/order");
const { param } = require("express-validator");
const order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.user,
        csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log("prodId", prodId);
  req.user
    .removeItemFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.email,
          userId: req.user,
        },
        products: products,
      });

      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("Order not found!"));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unathourized!"));
      }

      const invoice = "invoice-" + orderId + ".pdf";

      const invoicePath = path.join("data", "invoices", invoice);

      // fs.readFile(invoicePath, (err, data) => {

      //   if(err){
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('Content-Disposition', 'inline; filename="'+invoice+'"');
      //   res.send(data);
      // });

      const pdfDoc = new PDFDocument();
      //const file = fs.createReadStream(invoicePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoice + '"'
      );

      let totalAmount = 0; 
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.fontSize(25).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-------------------------");
      order.products.forEach((prod) => {
        totalAmount  = totalAmount + prod.product.price;
        pdfDoc.fontSize(14).text(
          prod.product.title +
            " - " +
            prod.quantity +
            " x " +
            " $" +
            prod.product.price
        );
      });

      pdfDoc.text("-------------------------");

      pdfDoc.fontSize(16).text("Total: $" + totalAmount);
      pdfDoc.end();

      const file = fs.createReadStream(invoicePath);

      file.pipe(res);
    })
    .catch((err) => next(err));
};
