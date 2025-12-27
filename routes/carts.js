const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// recieve post request to add to cart
router.post('/cart/products', async (req, res) => {
  // figure out cart
  let cart;
  if (!req.session.cartId) {
    // no current cart, need to create one
    // store cart id on req.session.cartId property
    cart = await cartsRepo.create({ items: []});
    req.session.cartId = cart.id
  } else {
    // have cart and need to get from repo
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  const existingItem = cart.items.find(item => item.id === req.body.productId);
  if (existingItem) {
    // increment quantity
    existingItem.quantity++;
  } else {
    // add item to items array
    cart.items.push({ id: req.body.productId, quantity: 1});
  }
  // now save to record
  await cartsRepo.update(cart.id, {items: cart.items});

  res.redirect('/cart');
});

// recieve get request to get all items in cart
router.get('/cart', async (req, res) => {
  if (!req.session.cartId) {
    return res.send('/');
  }
  const cart = await cartsRepo.getOne(req.session.cartId);

  for (let item of cart.items) {
    // item === { id: , quantity }
    const product = await productsRepo.getOne(item.id);

    item.product = product;
  }

  res.send(cartShowTemplate({ items: cart.items }));
});

// recieve post request to delete item from cart
router.post('/cart/products/delete', async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter(item => item.id !== itemId);

  await cartsRepo.update(req.session.cartId, { items });

  res.redirect('/cart')
});

module.exports = router;