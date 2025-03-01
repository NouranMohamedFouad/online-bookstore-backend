import {validateData} from '../middlewares/schemaValidator.js';
import {Cart, validate} from '../models/cart.js';

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({userId: req.user._id});
    if (!cart) return res.status(404).send('Cart not found');
    res.send(cart);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

export const addToCart = async (req, res) => {
  try {
    validateData(validate, req.body);

    let cart = await Cart.findOne({userId: req.user._id});
    if (!cart) {
      cart = new Cart({userId: req.user._id, items: [req.body]});
    } else {
      cart.items.push(req.body);
    }

    cart.total_price = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    await cart.save();
    res.send(cart);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
