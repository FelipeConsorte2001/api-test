const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select(['id', 'name', 'mail']);
  };
  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const getPasswdHash = (passwd) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(passwd, salt);
  };
  const save = async (user) => {
    if (!user.name) throw new ValidationError('Name is a mandatory attribute');
    if (!user.mail) throw new ValidationError('Email is a mandatory attribute');
    if (!user.passwd) throw new ValidationError('Password is a mandatory attribute');
    const userDb = await findOne({ mail: user.mail });
    if (userDb) { throw new ValidationError('There is already a user with this email address'); }

    const newUser = { ...user };
    newUser.passwd = getPasswdHash(user.passwd);
    return app.db('users').insert(newUser, ['id', 'name', 'mail']);
  };
  return { findAll, save, findOne };
};
