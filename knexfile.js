require('dotenv/config');

module.exports = {
  test: {
    client: 'pg',
    version: '15.2',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: process.env.PASSWORD_DB,
      database: 'barriga',
    },
    migration: {
      directory: 'migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
  },
};
