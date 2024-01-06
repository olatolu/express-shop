const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer  = require('multer')

const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const csrf = require('csurf');

const csrfProtection = csrf();

const User = require('./models/user');
const session = require('express-session');
const MongoDBStore = require('connect-mongo');
const flash = require('connect-flash');

const MONGODB_URI = 'mongodb://adminuser:RtEr3Dwr48ewr786@75.119.135.61:27015/node_shop?authSource=admin';

const storeSession = new MongoDBStore({
    mongoUrl: MONGODB_URI,
    collectionName: 'Sessions'
})

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorageConf = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },

    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + "-" + file.originalname)
    }
})

const fileFilterConf = (req, file, cb) => {
    const allowedMimetypes = ['image/png', 'image/jpg', 'image/jpeg']

    const foundMimetype = allowedMimetypes.find(mimetype => mimetype === file.mimetype);

    if(foundMimetype){
        cb(null, true);
    }else{
        cb(null, false);
    }
    

};

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({storage: fileStorageConf, fileFilter: fileFilterConf}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, 'images')));


app.use(session(
    {secret: 'my secret', resave: false, saveUninitialized: false, store: storeSession}
));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if(!req.session.user){
        next();
    }else{
    User.findById(req.session.user._id)
        .then(user => {
            if(!user){
                next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            // console.log(err)
            next(new Error(err));
        })
    }

});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    // res.redirect('/500');

    console.log('error', error);

    res.status(500).render('500', 
    { pageTitle: 'Error', path: '/500' }
    );
});

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        console.log('Dabase connected Successfully!')
        app.listen(3000);

    })
    .catch(err => console.log(err));