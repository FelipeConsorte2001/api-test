const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@gmail.com`;
test('Must list all users', () => {
  return request(app)
    .get('/users')
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});
test('Must insert user successfully', () => {
  return request(app)
    .post('/users')
    .send({ name: 'felipearaujo3', mail, passwd: 'felipearaujo3' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('felipearaujo3');
    });
});
test('You must not enter a user without a name', () => {
  return request(app)
    .post('/users')
    .send({ mail, passwd: '123456' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name is a mandatory attribute');
    });
});
test('You must not enter a user without email', async () => {
  const result = await request(app)
    .post('/users')
    .send({ name: 'felipearaujo3', passwd: 'felipearaujo3' });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email is a mandatory attribute');
});
test('You must not enter a user without a password', (done) => {
  request(app)
    .post('/users')
    .send({ name: 'felipearaujo3', mail: 'felipearaujo@gmail.com' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password is a mandatory attribute');
      done();
    });
});
test('You must not enter a user with an existing email address', () => {
  return request(app)
    .post('/users')
    .send({ name: 'felipearaujo3', mail, passwd: 'felipearaujo3' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        'There is already a user with this email address',
      );
    });
});
