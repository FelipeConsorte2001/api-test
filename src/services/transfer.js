const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .select();
  };
  const validate = async (transfer) => {
    if (!transfer.description) throw new ValidationError('description is a mandatory attribute');
    if (!transfer.amnount) throw new ValidationError('amnount is a mandatory attribute');
    if (!transfer.date) throw new ValidationError('date is a mandatory attribute');
    if (!transfer.acc_ori_id) throw new ValidationError('acc_ori is a mandatory attribute');
    if (!transfer.acc_dest_id) throw new ValidationError('acc_dest is a mandatory attribute');
    if (transfer.acc_dest_id === transfer.acc_ori_id) throw new ValidationError('it is not possible to transfer from an account to itself');
    const accounts = await app.db('accounts').whereIn('id', [transfer.acc_dest_id, transfer.acc_ori_id]);
    accounts.forEach((acc) => {
      if (acc.user_id !== parseInt(transfer.user_id, 10)) throw new ValidationError(`account #${acc.id} does not belong to user`);
    });
  };
  const save = async (transfer) => {
    const result = await app.db('transfers').insert(transfer, '*');
    const transferId = result[0].id;

    const transaction = [
      {
        description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, amnount: transfer.amnount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId,
      },
      {
        description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, amnount: transfer.amnount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: transferId,
      },
    ];
    await app.db('transactions').insert(transaction);
    return result;
  };

  const findOne = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .first();
  };
  const update = async (id, transfer) => {
    const result = await app.db('transfers')
      .where({ id })
      .update(transfer, '*');
    const transaction = [
      {
        description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, amnount: transfer.amnount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: id,
      },
      {
        description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, amnount: transfer.amnount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: id,
      },
    ];
    await app.db('transactions').where({ transfer_id: id }).del();
    await app.db('transactions').insert(transaction);
    return result;
  };
  return {
    find, save, findOne, update, validate,
  };
};
