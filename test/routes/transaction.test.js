const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

let user;
let user2;

let accUser;
let accUser2;

const MAIN_ROUTE = '/v1/transactions';

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();
  const users = await app.db('users').insert([
    { name: 'User #1', mail: 'user@mail.com', passwd: '$2a$10$is.MyRw3UhoHGp5RyIFRhOQE/ofPaDg6VouuWwwnQQPDANIRWq3sW' },
    { name: 'User #', mail: 'user2@mail.com', passwd: '$2a$10$u0.DFldABi3r1l1jnsaokumyoJvpNIFMterNlWgUtR.arb1CcpVvy' },
  ], '*');
  [user, user2] = users;
  delete user.passwd;

  user.token = jwt.encode(user, process.env.SECRET);

  const accs = await app.db('accounts').insert([
    { name: 'Acc #1', user_id: user.id },
    { name: 'Acc #2', user_id: user2.id },
  ], '*');
  [accUser, accUser2] = accs;
});

test('Should list only the users transactions', () => {
  return app.db('transactions').insert([
    {
      description: 'T1', date: new Date(), amnount: 100, type: 'I', acc_id: accUser.id,
    },
    {
      description: 'T2', date: new Date(), amnount: 100, type: 'O', acc_id: accUser2.id,
    },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('T1');
    }));
});

test('You must enter a transaction successfully', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .send({
      description: 'New T', date: new Date(), amnount: 100, type: 'I', acc_id: accUser.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body[0].acc_id).toBe(accUser.id);
      expect(res.body[0].amnount).toBe('100.00');
    });
});
test('input transaction must be positive', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .send({
      description: 'New T', date: new Date(), amnount: -100, type: 'I', acc_id: accUser.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body[0].acc_id).toBe(accUser.id);
      expect(res.body[0].amnount).toBe('100.00');
    });
});
test('transaction of outputs must be negative', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .send({
      description: 'New T', date: new Date(), amnount: 100, type: 'O', acc_id: accUser.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body[0].acc_id).toBe(accUser.id);
      expect(res.body[0].amnount).toBe('-100.00');
    });
});
test('transaction of outputs must be negative', () => {
  return request(app).post(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .send({
      description: 'New T', date: new Date(), amnount: 100, type: 'O', acc_id: accUser.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body[0].acc_id).toBe(accUser.id);
      expect(res.body[0].amnount).toBe('-100.00');
    });
});

describe('When trying to enter an invalid transaction', () => {
  let validTransaction;
  beforeAll(() => {
    validTransaction = {
      description: 'New T', date: new Date(), amnount: 100, type: 'O', acc_id: accUser.id,
    };
  });
  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('Authorization', `bearer ${user.token}`)
      .send({ ...validTransaction, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };
  test('you must not enter a non-descript', () => testTemplate({ description: null }, 'description is a mandatory attribute'));
  test('you must not enter a amount', () => testTemplate({ amnount: null }, 'amount is a mandatory attribute'));
  test('you must not enter a data', () => testTemplate({ date: null }, 'date is a mandatory attribute'));
  test('you must not enter a account', () => testTemplate({ acc_id: null }, 'account is a mandatory attribute'));
  test('you must not enter a type', () => testTemplate({ type: null }, 'type is a mandatory attribute'));
  test('you must not enter a invalid type', () => testTemplate({ type: 'A' }, 'invalid type'));

  test('you must not enter a amount transaction', () => {
    return request(app).post(MAIN_ROUTE)
      .set('Authorization', `bearer ${user.token}`)
      .send({
        description: 'New T', date: new Date(), type: 'O', acc_id: accUser.id,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('amount is a mandatory attribute');
      });
  });
});

test('Must change one transaction per id', () => {
  return app.db('transactions').insert({
    description: 'T PUT', date: new Date(), amnount: 100, type: 'I', acc_id: accUser.id,
  }, ['id']).then((res) => {
    request(app).put(`${MAIN_ROUTE}/${res[0].id}`)
      .set('Authorization', `bearer ${user.token}`)
      .send({
        description: 'T PUT', date: new Date(), amnount: 100, type: 'I', acc_id: accUser.id,
      })
      .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.id).toBe(res[0].id);
        expect(result.body.description).toBe('T PUT');
      });
  });
});
test('Must return one transaction per ID', () => {
  return app.db('transactions').insert({
    description: 'T ID', date: new Date(), amnount: 100, type: 'I', acc_id: accUser.id,
  }, ['id']).then((res) => {
    request(app).get(`${MAIN_ROUTE}/${res[0].id}`)
      .set('Authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(200);
        expect(result.body.id).toBe(res[0].id);
        expect(result.body.description).toBe('T ID');
      });
  });
});
test('must not remove another user\'s transfer', () => {
  return app.db('transactions').insert({
    description: 'To delete', date: new Date(), amnount: 100, type: 'I', acc_id: accUser2.id,
  }, ['id']).then((res) => {
    request(app).delete(`${MAIN_ROUTE}/${res[0].id}`)
      .set('Authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(403);
        expect(result.body.error).toBe('This resource does not belong to that user');
      });
  });
});
test('must not remove account with transaction', () => {
  return app.db('transactions').insert({
    description: 'To delete', date: new Date(), amnount: 100, type: 'I', acc_id: accUser.id,
  }, ['id']).then(() => {
    request(app).delete(`/v1/accounts/${accUser.id}`)
      .set('Authorization', `bearer ${user.token}`)
      .then((result) => {
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('this account has associated tansation');
      });
  });
});
