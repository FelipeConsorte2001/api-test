const request = require('supertest');

const app = require('../../src/app');

test('Must not access a protected route without a token', () => {
  return request(app).post('/auth/signup')
    .send({ name: 'Walter', mail: `${Date.now()}@gmail.com`, passwd: '1213456' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter');
      expect(res.body).toHaveProperty('mail');
      expect(res.body).not.toHaveProperty('passwd');
    });
});

test('Must receive token when logging in', () => {
  const mail = `${Date.now()}@gmail.com`;
  return app.services.user.save({ name: 'Walter', mail, passwd: '123456' })
    .then(() => request(app).post('/auth/signin')
      .send({ mail, passwd: '123456' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

test('Must not authenticate user with wrong password', () => {
  const mail = `${Date.now()}@gmail.com`;
  return app.services.user.save({ name: 'Walter', mail, passwd: '123456' })
    .then(() => request(app).post('/auth/signin')
      .send({ mail, passwd: '654321' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Wrong user or password');
    });
});
test('You should not enter a user with the wrong password', () => {
  return request(app).post('/auth/signin')
    .send({ mail: 'nãotemuser@gmail.com', passwd: '654321' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Wrong user or password');
    });
});
test('Must not access a protected route without a token', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(401);
    });
});
