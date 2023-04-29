const request = require('supertest');

const app = require('../../src/app');

test('Must receive token when logging in', () => {
  const mail = `${Date.now()}@gmail.com`;
  return app.services.user.save({ name: 'Walter', mail, passwd: '123456' })
    .then(() => request(app).post('/auth/signin')
      .send({ mail, passwd: '123456' }))
    .then((res) => {
      expect(res.status).toBe(200);
      console.log(res.body);
      expect(res.body).toHaveProperty('token');
    });
});
