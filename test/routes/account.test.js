const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;
beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'User Account',
    mail: `${Date.now()}@gmail.com`,
    passwd: '123456',
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, process.env.SECRET);

  const res2 = await app.services.user.save({
    name: 'User Account 2',
    mail: `${Date.now()}@gmail.com`,
    passwd: '123456',
  });
  user2 = { ...res2[0] };
});
// beforeEach(async () => {
//   await app.db('transactions').del();
//   await app.db('accounts').del();
// });
test('You must successfully enter an account', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .send({ name: 'Acc #1' })
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Acc #1');
    });
});
test('you must not enter an account without a name ', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .send()
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Name is a mandatory attribute');
    });
});

test.skip('Must list all accounts', () => {
  return app.db('accounts').insert({ name: 'Acc list', user_id: user.id })
    .then(() => request(app).get(MAIN_ROUTE)
      .set('Authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});
test('Must list a accounts by id', () => {
  return app.db('accounts')
    .insert({ name: 'Acc by Id', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc by Id');
      expect(res.body.user_id).toBe(user.id);
    });
});
test('Should I change an account', () => {
  return app.db('accounts')
    .insert({ name: 'Acc To Update', user_id: user.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `bearer ${user.token}`)
      .send({ name: 'Acc updated' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc updated');
    });
});
test('Should I remove an account', () => {
  return app.db('accounts')
    .insert({ name: 'Acc To remove', user_id: user.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Should list only user accounts', async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  return app.db('accounts').insert([
    { name: 'Acc User #1', user_id: user.id },
    { name: 'Acc User #2', user_id: user2.id },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Acc User #1');
    }));
});

test('you must not insert a duplicate account with a duplicate name, for the same user', () => {
  return app.db('accounts').insert({ name: 'Acc duplicada', user_id: user.id })
    .then(() => request(app).post(MAIN_ROUTE)
      .set('Authorization', `bearer ${user.token}`)
      .send({ name: 'Acc duplicada' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('There is already an account with that name');
      }));
});
test('must not return an account from another user', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `bearer ${user.token}`)).then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('This resource does not belong to that user');
    });
});

test('Não deve alterar a conta de outro usúario', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: 'Acc duplicada' })
      .set('Authorization', `bearer ${user.token}`)).then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('This resource does not belong to that user');
    });
});
test('Não deve remover a conta de outro usúario', () => {
  return app.db('accounts')
    .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('Authorization', `bearer ${user.token}`)).then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('This resource does not belong to that user');
    });
});
