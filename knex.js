'use strict';


// The knex.js file loads knexfile.js and connects to the database using the appropriate configuration object for the environment. It then exports the connection.

const knexConfig = require('./knexfile');

const environment = process.env.NODE_ENV || 'development';

module.exports = require('knex')(knexConfig[environment]);
