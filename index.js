const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const productsRouter = require('./routes/admin/products');

// app is object to tell webserver what to recieve/do
const app = express();

app.use(express.static('public'))
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  keys: ['wendspkseingucadf']
}));

app.use(authRouter);
app.use(productsRouter);

app.listen(3000, () => {
  console.log('Listening')
});