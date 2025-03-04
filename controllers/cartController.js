import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Cart, validate} from '../models/cart.js';
import {Users} from '../models/users.js';

const getAll = asyncWrapper(async () => {
  const cart = await Cart.find({}).exec();
  return cart;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const cart = await Cart.create(data);
  return cart;
});

// delete cart by id
const deleteById = asyncWrapper(async (id) => {
  validateData(validate, id);
  const cart = await Cart.findByIdAndDelete(id);
  return 'Cart deleted successfully';
});

export const addItemToCart = async (req, res) => {
  const {error} = validate(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }

  const user = await Users.findById(req.body.userId);
  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }

  const book = await Books.findById(req.body.bookId);
  if (!book) {
    return res.status(404).json({message: 'Book not found'});
  }

  let cart = await Cart.findOne({userId: req.body.userId});
  if (!cart) {
    cart = new Cart({
      userId: req.body.userId,
      items: [],
      total_price: 0
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.bookId.toString() === req.body.bookId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += req.body.quantity;
    cart.items[itemIndex].price = req.body.price;
  } else {
    cart.items.push({
      bookId: req.body.bookId,
      quantity: req.body.quantity,
      price: req.body.price
    });
  }

  cart.total_price = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  await cart.save();
  res.status(200).json({status: 'success', data: {cart}});
};

export const removeItemFromCart = async (req, res) => {
  const {userId, bookId} = req.body;

  const cart = await Cart.findOne({userId});
  if (!cart) {
    return res.status(404).json({message: 'Cart not found'});
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.bookId.toString() === bookId
  );

  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1);
    cart.total_price = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    await cart.save();
    return res.status(200).json({status: 'success', data: {cart}});
  } else {
    return res.status(404).json({message: 'Item not found in cart'});
  }
};

export const showCartItems = async (req, res) => {
  const {userId} = req.params;

  const cart = await Cart.findOne({userId}).populate('items.bookId');
  if (!cart) {
    return res.status(404).json({message: 'Cart not found'});
  }

  res.status(200).json({status: 'success', data: {cart}});
};
const updateById = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value !== undefined
      && value !== null
      && value !== ''

    ) {
      fieldsToUpdate[key] = value;
    }
  }
  validatePartialData(validate, fieldsToUpdate);
  console.log(fieldsToUpdate);
  console.log(id);
  const updatedcart = await Cart.findOneAndUpdate(
    {cartId: id},
    fieldsToUpdate,
    {new: true}
  );
  return updatedcart;
});

export {create, deleteById, getAll, updateById};
