const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {

    User.findById('642600b0ad25c8487c9d71de')
    .then(user => {
        req.user = user;
        next();
      }
    )
    .catch(err => console.log(err))

});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


mongoose
    .connect('mongodb+srv://node_shop:QswAK0H2yFYeufdL@mongodbc0.trx00jv.mongodb.net/node_shop')
    .then(result => {
        User.findOne()
        .then(user => {
            if(!user){
                const user = new User({
                    name: 'olatolu',
                    email: 'test@test.com',
                    cart:  {
                        items: []
                    }
                })
                user.save()
            }
        })
        console.log('Dabase connected Successfully!')
        app.listen(3000);

    })
    .catch(err => console.log(err));