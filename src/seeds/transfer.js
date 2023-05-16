/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      {
        id: 10000, name: 'User #1', mail: 'user1@gmail.com', passwd: '$2a$10$is.MyRw3UhoHGp5RyIFRhOQE/ofPaDg6VouuWwwnQQPDANIRWq3sW',
      },
      {
        id: 10001, name: 'User #2', mail: 'user2@gmail.com', passwd: '$2a$10$is.MyRw3UhoHGp5RyIFRhOQE/ofPaDg6VouuWwwnQQPDANIRWq3sW',
      },
    ]))
    .then(() => knex('accounts').insert([
      { id: 10000, name: 'accO #1', user_id: 10000 },
      { id: 10001, name: 'accD #1', user_id: 10000 },
      { id: 10002, name: 'accO #2', user_id: 10001 },
      { id: 10003, name: 'accD #2', user_id: 10001 },
    ]))
    .then(() => knex('transfers').insert([
      {
        id: 10000, description: 'Transfer #1', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date(),
      },
      {
        id: 10001, description: 'Transfer #2', user_id: 10001, acc_ori_id: 10002, acc_dest_id: 10003, ammount: 100, date: new Date(),
      },
    ]))
    .then(() => knex('transactions').insert([
      {
        description: 'Transferencia from acco #1', date: new Date(), amnount: 100, type: 'I', acc_id: 10001, transfer_id: 10000,
      },
      {
        description: 'Transferencia to accD #1', date: new Date(), amnount: -100, type: 'O', acc_id: 10000, transfer_id: 10000,
      },
      {
        description: 'Transferencia from acco #2', date: new Date(), amnount: 100, type: 'I', acc_id: 10003, transfer_id: 10001,
      },
      {
        description: 'Transferencia to accD #2', date: new Date(), amnount: -100, type: 'O', acc_id: 10002, transfer_id: 10001,
      },
    ]));
};
