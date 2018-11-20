'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost/noteful-app',
    debug: true, // http://knexjs.org/#Installation-debug
    pool: { min: 1, max: 2 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};

// The knexfile.js is a knex specific configuration file, you can learn more here. Currently, it contains two environments: "development" and "production". Each environment property has a connection object appropriate to the environment.
