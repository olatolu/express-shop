const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_shop', 'homestead', 'secret', {dialect: 'mysql', host: '192.168.56.56', port: 3306});


module.exports = sequelize;