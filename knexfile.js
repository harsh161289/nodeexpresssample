// Update with your config settings.
const connection = require('./connection')();


module.exports = {

  development: connection,

  staging: connection,

  production: connection

};
