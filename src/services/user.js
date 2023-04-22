module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select();
  };
  const save = (user) => {
    if (!user.name) return { error: 'Nome é um atributo obrigatorio' };
    if (!user.mail) return { error: 'Email é um atributo obrigatorio' };
    if (!user.passwd) return { error: 'Senha é um atributo obrigatorio' };
    return app.db('users').insert(user, '*');
  };
  return { findAll, save };
};
