const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };
  const save = async (user) => {
    if (!user.name) throw new ValidationError('Name is a mandatory attribute');
    if (!user.mail) throw new ValidationError('Email is a mandatory attribute');
    if (!user.passwd) throw new ValidationError('Password is a mandatory attribute');
    const userDb = await findAll({ mail: user.mail });
    if (userDb && userDb.length > 0) { throw new ValidationError('There is already a user with this email address'); }
    return app.db('users').insert(user, '*');
  };
  return { findAll, save };
};
