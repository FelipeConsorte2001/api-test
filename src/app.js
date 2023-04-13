const app = require('express')();

app.get('/', (req, res) => {
  res.status(200).send();
});
app.get('/users', (req, res) => {
  const users = [
    { name: 'John Doe', mail: 'joen#mail.com' },
  ];
  res.status(200).json(users);
});
app.post('/users', (req, res) => {
  return res.status(201).json({ name: 'Walter Mitty', mail: 'joen#mail.com' });
});
module.exports = app;
