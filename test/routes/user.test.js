const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@gmail.com`;
test('Deve listar todos os usários', () => {
  return request(app).get('/users').then((res) => {
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
test('Deve inserir usuário com sucesso', () => {
  return request(app).post('/users').send({ name: 'felipearaujo3', mail, passwd: 'felipearaujo3' }).then((res) => {
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('felipearaujo3');
  });
});
test('Não deve inserir um usuario sem nome', () => {
  return request(app).post('/users').send({ mail, passwd: '123456' }).then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nome é um atributo obrigatorio');
  });
});
test('Não deve inserir um usuario sem email', async () => {
  const result = await request(app).post('/users').send({ name: 'felipearaujo3', passwd: 'felipearaujo3' });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatorio');
});
test('Não deve inserir um usuario sem senha', (done) => {
  request(app).post('/users').send({ name: 'felipearaujo3', mail: 'felipearaujo@gmail.com' }).then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Senha é um atributo obrigatorio');
    done();
  });
});
test('Não deve inserir um usuario com email existente', () => {
  return request(app).post('/users').send({ name: 'felipearaujo3', mail, passwd: 'felipearaujo3' }).then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Já existe um usuario com esse email');
  });
});
