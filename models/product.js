const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    require: true
  },

  description: {
    type: String,
    require: true
  },

  imageUrl: {
    type: String,
    require: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);


// const getDb = require('../util/database').getDb;

// const mongoDb = require('mongodb');

// class Product {
//   constructor(title, price, description, imageUrl, id, userId){
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongoDb.ObjectId(id) :  null;
//     this.userId = userId;
//   }

//   save(){
//     const db =  getDb();
//     let dbOps;
//     if(this._id){
//       dbOps = db.collection('products').updateOne({_id: new mongoDb.ObjectId(this._id)}, {$set: this})
//     }else{
//     dbOps = db.collection('products').insertOne(this);
//     }
//     return dbOps
//       .then(result => {
//         return result;
//         // console.log('result',result);
//       })
//       .catch(err => console.log(err))
//   };

//   static fetchAll(){
//     const db =  getDb();

//     return db.collection('products').find().toArray()
//     .then(products => {
//       return products;
//     })
//     .catch(err => console.log(err));

//   }

//   static findById(prodId){
//     const db =  getDb();
//     return db
//       .collection('products')
//       .find({_id: new mongoDb.ObjectId(prodId)})
//       .next()
//       .then(product => {
//         console.log(product);
//         return product;
//       })
//       .catch(err => console.log(err));

//   }

//   static deleteById(prodId){
//     const db =  getDb();
//     return db.collection('products')
//       .deleteOne({_id: new mongoDb.ObjectId(prodId)})
//       .then(result => {
//         console.log('Deleted');
//         return result
//       })
//       .catch(err => console.log(err));
//   }
// }


// module.exports = Product;