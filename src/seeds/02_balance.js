/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  // Deletes ALL existing entries
  knex('users').insert([
    {
      id: 10010, name: 'User #3', mail: 'user3@gmail.com', passwd: '$2a$10$is.MyRw3UhoHGp5RyIFRhOQE/ofPaDg6VouuWwwnQQPDANIRWq3sW',
    },
    {
      id: 10101, name: 'User #4', mail: 'user4@gmail.com', passwd: '$2a$10$is.MyRw3UhoHGp5RyIFRhOQE/ofPaDg6VouuWwwnQQPDANIRWq3sW',
    },
  ]).then(() => knex('accounts').insert([
    { id: 10100, name: 'acc Saldo Principal', user_id: 10100 },
    { id: 10101, name: 'acc Saldo Seundario', user_id: 10100 },
    { id: 10102, name: 'acc Alternativa 1', user_id: 10101 },
    { id: 10103, name: 'acc Alternativa 2', user_id: 10101 },
  ]));
};
