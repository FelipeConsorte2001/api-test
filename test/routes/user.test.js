const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';

let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'User Account',
    mail: `${Date.now()}@gmail.com`,
    passwd: '123456',
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, process.env.SECRET);
});
const mail = `${Date.now()}@gmail.com`;
test('Must list all users', () => {
  return request(app)
    .get(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});
test('Must insert user successfully', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ name: 'felipearaujo3', mail, passwd: 'felipearaujo3' })
    .set('Authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('felipearaujo3');
      expect(res.body).not.toHaveProperty('passwd');
    });
});

test('Must store an encrypted password', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter Mitty', mail: `${Date.now()}@gmail.com`, passwd: '123456' })
    .set('Authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);
  const { id } = res.body;
  const userDb = await app.services.user.findOne({ id });
  expect(userDb.passwd).not.toBeUndefined();
  expect(userDb.passwd).not.toBe('123456');
});

test('You must not enter a user without a name', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ mail, passwd: '123456' })
    .set('Authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name is a mandatory attribute');
    });
});
test('You must not enter a user without email', async () => {
  const result = await request(app)
    .post(MAIN_ROUTE)
    .send({ name: 'felipearaujo3', passwd: 'felipearaujo3' })
    .set('Authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email is a mandatory attribute');
});
test('You must not enter a user without a password', (done) => {
  request(app)
    .post(MAIN_ROUTE)
    .set('Authorization', `bearer ${user.token}`)
    .send({ name: 'felipearaujo3', mail: 'felipearaujo@gmail.com' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password is a mandatory attribute');
      done();
    });
});
test('You must not enter a user with an existing email address', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .send({ name: 'felipearaujo3', mail, passwd: 'felipearaujo3' })
    .set('Authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        'There is already a user with this email address',
      );
    });
});
