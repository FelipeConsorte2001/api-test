const request = require('supertest');

const app = require('../../src/app');

beforeAll(async () => {
  // await app.db.migrate.rollback();
  // await app.db.migrate.latest();
  await app.db.seed.run();
});
const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQGdtYWlsLmNvbSJ9.nifylsPUk4WSSMEgeCD39Vb81PV3tFJzp1fzD1plitU';
test('should list only user transfers', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Transfer #1');
    });
});
test('you must enter a successful transfer', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({
      description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, amnount: 100, date: new Date(),
    })
    .then(async (res) => {
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Regular Transfer');
      const transactions = await app.db('transactions').where({ transfer_id: res.body.id });
      expect(transactions).toHaveLength(2);
      expect(transactions[0].description).toBe('Transfer to acc #10001');
      expect(transactions[1].description).toBe('Transfer from acc #10000');
      expect(transactions[0].amnount).toBe('-100.00');
      expect(transactions[1].amnount).toBe('100.00');
      expect(transactions[0].acc_id).toBe(10000);
      expect(transactions[1].acc_id).toBe(10001);
    });
});

describe('when saving a valid transfer...', () => {
  let transferId;
  let inCome;
  let outCome;
  test('should return to status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, amnount: 100, date: new Date(),
      })
      .then(async (res) => {
        expect(res.status).toBe(201);
        expect(res.body.description).toBe('Regular Transfer');
        transferId = res.body.id;
      });
  });
  test('transactions must have been generated', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('amnount');
    expect(transactions).toHaveLength(2);
    [outCome, inCome] = transactions;
  });

  test('the outgoing transaction must be negative', () => {
    expect(outCome.description).toBe('Transfer to acc #10001');
    expect(outCome.amnount).toBe('-100.00');
    expect(outCome.acc_id).toBe(10000);
    expect(outCome.type).toBe('O');
  });
  test('the outgoing transaction must be positive', () => {
    expect(inCome.description).toBe('Transfer from acc #10000');
    expect(inCome.amnount).toBe('100.00');
    expect(inCome.acc_id).toBe(10001);
    expect(inCome.type).toBe('I');
  });
  test('both must be referenced to the transfer that originated them', () => {
    expect(inCome.transfer_id).toBe(transferId);
    expect(outCome.transfer_id).toBe(transferId);
  });
});

describe('when trying to save an invalid transfer', () => {
  const validTransfer = {
    description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, amnount: 100, date: new Date(),
  };
  const template = (newData, menssagem) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        ...validTransfer, ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(menssagem);
      });
  };

  test('You must not insert without description', () => template({ description: null }, 'description is a mandatory attribute'));
  test('You must not insert without value', () => template({ amnount: null, description: 'test' }, 'amnount is a mandatory attribute'));
  test('You must not insert without date', () => template({ date: null }, 'date is a mandatory attribute'));
  test('Must not insert without source account', () => template({ acc_ori_id: null }, 'acc_ori is a mandatory attribute'));
  test('You must not insert without target account', () => template({ acc_dest_id: null }, 'acc_dest is a mandatory attribute'));
  test('You must not enter whether the source and destination accounts should be the same', () => template({ acc_dest_id: 10000 }, 'it is not possible to transfer from an account to itself'));
  test('Should not insert if the accounts belong to another user', () => template({ acc_ori_id: 10002 }, 'account #10002 does not belong to user'));
});

test('Should return the transfer by ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Transfer #1');
    });
});

describe('You must change a valid transfer...', () => {
  let transferId;
  let inCome;
  let outCome;
  test('should return to status 200', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        description: 'Transfer updated', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, amnount: 500, date: new Date(),
      })
      .then(async (res) => {
        expect(res.status).toBe(200);
        expect(res.body.description).toBe('Transfer updated');
        expect(res.body.amnount).toBe('500.00');
        transferId = res.body.id;
      });
  });
  test('transactions must have been generated', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('amnount');
    expect(transactions).toHaveLength(2);
    [outCome, inCome] = transactions;
  });

  test('the outgoing transaction must be negative', () => {
    expect(outCome.description).toBe('Transfer to acc #10001');
    expect(outCome.amnount).toBe('-500.00');
    expect(outCome.acc_id).toBe(10000);
    expect(outCome.type).toBe('O');
  });
  test('the outgoing transaction must be positive', () => {
    expect(inCome.description).toBe('Transfer from acc #10000');
    expect(inCome.amnount).toBe('500.00');
    expect(inCome.acc_id).toBe(10001);
    expect(inCome.type).toBe('I');
  });
  test('both must be referenced to the transfer that originated them', () => {
    expect(inCome.transfer_id).toBe(transferId);
    expect(outCome.transfer_id).toBe(transferId);
  });
});

describe('when trying to update an invalid transfer', () => {
  const validTransfer = {
    description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, amnount: 100, date: new Date(),
  };
  const template = (newData, menssagem) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({
        ...validTransfer, ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(menssagem);
      });
  };

  test('You must not insert without description', () => template({ description: null }, 'description is a mandatory attribute'));
  test('You must not insert without value', () => template({ amnount: null, description: 'test' }, 'amnount is a mandatory attribute'));
  test('You must not insert without date', () => template({ date: null }, 'date is a mandatory attribute'));
  test('Must not insert without source account', () => template({ acc_ori_id: null }, 'acc_ori is a mandatory attribute'));
  test('You must not insert without target account', () => template({ acc_dest_id: null }, 'acc_dest is a mandatory attribute'));
  test('You must not enter whether the source and destination accounts should be the same', () => template({ acc_dest_id: 10000 }, 'it is not possible to transfer from an account to itself'));
  test('Should not insert if the accounts belong to another user', () => template({ acc_ori_id: 10002 }, 'account #10002 does not belong to user'));
});

describe('When removing a transfer', () => {
  test('Deve retorna o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10000`)
      .set('Authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('the record must have been removed from the bank', () => {
    return app.db('transfers').where({ id: 10000 })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });

  test('The associated transactions must have been remitted as well', () => {
    return app.db('transactions').where({ transfer_id: 10000 })
      .then((result) => {
        expect(result).toHaveLength(0);
      });
  });
});

test('must not return transference from another user', () => {
  return request(app).get(`${MAIN_ROUTE}/10001`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('This resource does not belong to that user');
    });
});
