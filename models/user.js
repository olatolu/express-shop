const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,       
        index: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true}
        }
        ]
    }
})

userSchema.methods.addToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    });
      
    let newQuantity = 1;

    const updatedCartItems = [...this.cart.items];

    if(cartProductIndex >= 0){
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
      updatedCartItems.push({productId: product._id, quantity: newQuantity})
    }
    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    this.save();
}

userSchema.methods.removeItemFromCart =  function(productId){

const updatedCart = this.cart.items.filter(i => {
    return i.productId.toString() !== productId.toString()
}) 
this.cart.items = updatedCart;
return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('User', userSchema, 'Users');

// const getDb = require('../util/database').getDb;

// const mongoDb = require('mongodb')

// const ObjectId = mongoDb.ObjectId;
// class User{
//   constructor(username, email, cart, id){
//     this.username = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save(){
//     const db =  getDb();
//     return db.collection('users').insertOne(this)
//       .then(result => {
//         return result;
//         // console.log('result',result);
//       })
//       .catch(err => console.log(err))
//   };

//   addToCart(product){
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString()
//     });
      
//     let newQuantity = 1;

//     const updatedCartItems = [...this.cart.items];

//     if(cartProductIndex >= 0){
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     }else{
//       updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity})
//     }
//     const db =  getDb();
//     const updatedCart = {items: updatedCartItems};
//     return db.collection('users').updateOne(
//       {_id: new ObjectId(this._id)},
//       {$set: {cart: updatedCart}}
//       ).then(result => {
//         console.log('result', result);
//         return result;
//       }).catch(err => console.log(err));

//   }

//   deleteItemFromCart(prodId){
//     const db = getDb();

//     const updatedCart = this.cart.items.filter(i => {
//       return i.productId.toString() !== prodId.toString()
//     }) 
//     return db.collection('users').updateOne(
//       {_id: new ObjectId(this._id)},
//       {$set: {cart: {items: updatedCart} } }
//       ).then(result => {
//         console.log('result', result);
//         return result;
//       }).catch(err => console.log(err));

//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: new ObjectId(this._id),
//             username: this.username,
//             email: this.email
//           }
//         };
//         return db.collection('orders').insertOne(order);
//       })
//       .then(result => {
//         this.cart = { items: [] };
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getCart() {
//   //this.cleanUpCart();
//     const db = getDb();
//     const productIds = this.cart.items.map(i => {
//       return i.productId;
//     });
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then(products => {
//         return products.map(p => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(i => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity
//           };
//         });
//       });
//   }

//   getOrders(){
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({'user._id': this._id})
//       .toArray()
//       .then(orders => {
//         return orders;
//       }).catch(err => console.log(err));
//   }

//   static findById(userId){
//     const db =  getDb();
//     return db
//       .collection('users')
//       .findOne({_id: new mongoDb.ObjectId(userId)})
//       .then(user => {
//         console.log(user);
//         return user;
//       })
//       .catch(err => console.log(err));
//   };

//   cleanUpCart(){
//     const db = getDb();
//     const productIds = this.cart.items.map(i => {
//       return i.productId;
//     });
//       db.collection('products')
//         .find({ _id: { $in: productIds } })
//         .toArray()
//         .then(products => {
//           return products.map(i => i._id);
//         })
//         .then(products => {
//           console.log('products', products)
//           return this.cart.items.filter(i => products.includes(i));
//         })
//         .then(updatedCart => {
//             console.log('updatedCart', updatedCart)
//             if(updatedCart.length > 0){
//             return db.collection('users').updateOne(
//               {_id: new ObjectId(this._id)},
//               {$set: {cart: {items: updatedCart} } }
//               )
//             }
//         }).catch(err => console.log(err));
    
//   }
// }
  

// module.exports = User;