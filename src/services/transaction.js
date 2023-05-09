module.exports = (app) => {
  const find = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();
  };
  const findOne = (filter) => {
    return app.db('transactions')
      .where(filter)
      .first();
  };
  const save = (transaction) => {
    const newTransaction = { ...transaction };
    if ((transaction.type === 'I' && transaction.amnount < 0) || (transaction.type === 'O' && transaction.amnount > 0)) {
      newTransaction.amnount *= -1;
    }
    return app.db('transactions')
      .insert(newTransaction, '*');
  };
  const update = (id, transactions) => {
    return app.db('transactions').where({ id }).update(transactions, '*');
  };
  const remove = (id) => {
    return app.db('transactions').where({ id }).del();
  };
  return {
    find, save, findOne, update, remove,
  };
};
