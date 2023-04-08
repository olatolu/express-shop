const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const csrf = require('csurf');

const csrfProtection = csrf();

const User = require('./models/user');
const session = require('express-session');
const MongoDBStore = require('connect-mongo');
const flash = require('connect-flash');

const MONGODB_URI = 'mongodb+srv://node_shop:QswAK0H2yFYeufdL@mongodbc0.trx00jv.mongodb.net/node_shop';

const storeSession = new MongoDBStore({
    mongoUrl: MONGODB_URI,
    collectionName: 'Sessions'
})

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(
    {secret: 'my secret', resave: false, saveUninitialized: false, store: storeSession}
));

app.use((req, res, next) => {
    if(!req.session.user){
        next();
    }else{
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err))
    }

});

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        console.log('Dabase connected Successfully!')
        app.listen(3000);

    })
    .catch(err => console.log(err));