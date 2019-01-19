const mongoose = require('mongoose');
const mongoConfig = require('../configs/secret.json').mongo;

let connection;

module.exports = async function getMongoConnection() {
  if (connection) {
    return connection;
  }
  connection = await mongoose.connect(mongoConfig.connectionString);
  return connection;
};
