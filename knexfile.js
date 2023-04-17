module.exports = {
  test: {
    client: 'pg',
    version: '15.2',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'Postgres2019!',
      database: 'barriga',
    },
    migration: {
      directory: 'src/migrations',
    },
  },
};
