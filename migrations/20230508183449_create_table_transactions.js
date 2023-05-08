/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.string('description').notNull();
    table.enu('type', ['I', 'O']).notNull();
    table.date('date').notNull();
    table.decimal('amnount', 15, 2).notNull();
    table.boolean('status').notNull().default(false);
    table.integer('acc_id').references('id')
      .inTable('accounts')
      .notNull();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTable('transactions');
};
