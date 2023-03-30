const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://node_shop:QswAK0H2yFYeufdL@mongodbc0.trx00jv.mongodb.net/node_shop')
    .then(client => {
        console.log('MongoDb Connected Successfully!');
        _db = client.db();
        callback(client);
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => {
    if(_db){
        return _db;
    }

    throw 'No Database Found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;