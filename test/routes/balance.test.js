const request = require('supertest');
const moment = require('moment');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const MAIN_TRASACTION = '/v1/transactions';
const MAIN_ROUTE_TRANSFER = '/v1/transfers';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMTAwIiwibmFtZSI6IlVzZXIgIzMiLCJtYWlsIjoidXNlcjNAZ21haWwuY29tIn0.R0Jl0YD7RjsUmXsDG9w8U-SkEoyumFzSY6lVaBOITc0';
beforeAll(async () => {
  await app.db.seed.run();
});
describe('Ao calcular o saldo do usuario', () => {
  test('Deve retorna apenas as contas com alguma transations', () => {
    return request(app).get(`${MAIN_ROUTE}`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
      });
  });
  test('Deve adicionar valores de entrada', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: new Date(), amnount: 100, type: 'I', acc_id: 10100, status: true,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('100.00');
          });
      });
  });
  test('Deve subtrair valores de saida', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: new Date(), amnount: 200, type: 'O', acc_id: 10100, status: true,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });
  test('Não deve considerar transaçoes pendentes', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: new Date(), amnount: 200, type: 'O', acc_id: 10100, status: false,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });
  test('Não deve considerar saldo de contas distintas', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: new Date(), amnount: 50, type: 'I', acc_id: 10101, status: true,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Não deve considerar saldo de outros usuarios', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: new Date(), amnount: 200, type: 'O', acc_id: 10102, status: true,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('deve considerar transferencia passada', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: moment().subtract({ days: 5 }), amnount: 250, type: 'I', acc_id: 10100, status: true,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('não deve considerar transferencia futura', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: moment().add({ days: 5 }), amnount: 250, type: 'I', acc_id: 10100, status: true,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('deve considerar transferencia', () => {
    return request(app).post(`${MAIN_TRASACTION}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: '1', date: new Date(), amnount: 250, acc_ori_id: 10100, acc_dest_id: 10101,
      })
      .then(() => {
        return request(app).get(`${MAIN_ROUTE_TRANSFER}`)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('200.00');
          });
      });
  });
});
