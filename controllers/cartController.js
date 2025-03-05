import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import CustomError from '../helpers/customErrors.js';
// import {validateData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Cart} from '../models/cart.js';
// import {Users} from '../models/users.js';

const getAll = asyncWrapper(async () => {
  const cart = await Cart.find({}).exec();
  return cart;
});

const create = asyncWrapper(async (data, user) => {
  const book = await Books.findById(data.bookId);
  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  let cart = await Cart.findOne({userId: user._id});

  if (!cart) {
    if (book.stock < 1) {
      throw new CustomError('Insufficient stock for this book', 400);
    }

    cart = await Cart.create({
      userId: user._id,
      items: [{bookId: book._id, quantity: 1, price: book.price}],
      total_price: book.price
    });
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === book._id.toString()
    );

    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + 1;
      if (newQuantity > book.stock) {
        throw new CustomError('Insufficient stock for this book', 400);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      if (book.stock < 1) {
        throw new CustomError('Insufficient stock for this book', 400);
      }

      cart.items.push({bookId: book._id, quantity: 1, price: book.price});
    }

    cart.total_price += Math.round(book.price, 2);
    await cart.save();
  }

  return cart;
});

const deleteById = asyncWrapper(async (bookId) => {
  const book = await Books.findOne({bookId});
  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  const book_id = new mongoose.Types.ObjectId(book._id);

  const cart = await Cart.findOne({'items.bookId': book_id});
  if (!cart) {
    throw new CustomError('Cart not found', 404);
  }

  cart.items = cart.items.filter((item) => item.bookId.toString() !== book_id.toString());
  cart.total_price = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  await cart.save();

  return `Book deleted successfully from cart: ${cart}`;
});

export {create, deleteById, getAll};
