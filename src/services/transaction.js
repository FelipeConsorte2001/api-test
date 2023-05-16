const ValidationError = require('../errors/validationError');

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
    if (!transaction.description) throw new ValidationError('description is a mandatory attribute');
    if (!transaction.amnount) throw new ValidationError('amount is a mandatory attribute');
    if (!transaction.date) throw new ValidationError('date is a mandatory attribute');
    if (!transaction.acc_id) throw new ValidationError('account is a mandatory attribute');
    if (!transaction.type) throw new ValidationError('type is a mandatory attribute');
    if (!(transaction.type === 'I' || transaction.type === 'O')) throw new ValidationError('invalid type');

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
