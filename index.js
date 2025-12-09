const express = require('express');
const bodyParser = require('body-parser');

// app is object to tell webserver what to recieve/do
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// request response
app.get('/', (req, res) => {
  res.send(`
    <div>
      <form method="POST">
        <input name="email" placeholder="email">
        <input name="password" placeholder="password">
        <input name="passwordConfirmaion" placeholder="password confirmation">
        <button>Sign Up</button>
      </form>
    </div>
  `)
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send('Account Created')
});

app.listen(3000, () => {
  console.log('Listening')
});