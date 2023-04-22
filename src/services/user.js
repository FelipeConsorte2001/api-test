module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };
  const save = async (user) => {
    if (!user.name) return { error: 'Name is a mandatory attribute' };
    if (!user.mail) return { error: 'Email is a mandatory attribute' };
    if (!user.passwd) return { error: 'Password is a mandatory attribute' };
    const userDb = await findAll({ mail: user.mail });
    if (userDb && userDb.length > 0) return { error: 'There is already a user with this email address' };
    return app.db('users').insert(user, '*');
  };
  return { findAll, save };
};
