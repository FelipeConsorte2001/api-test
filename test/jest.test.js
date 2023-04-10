test('Devo conhecer as principais asserivas do jest', () => {
  let number = null;
  expect(number).toBeNull();
  number = 10;
  expect(number).not.toBeNull();
  expect(number).toBe(10);
  expect(number).toEqual(10);
  expect(number).toBeGreaterThan(9);
  expect(number).toBeLessThan(11);
});

test('Devo saber trabalhar com objetos', () => {
  const obj = { name: 'Jonh', email: 'jonh@gmail.com' };
  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('name', 'Jonh');
  expect(obj.name).toBe('Jonh');
  const obj2 = { name: 'Jonh', email: 'jonh@gmail.com' };
  expect(obj2).toEqual(obj2);
  expect(obj).toBe(obj);
});
