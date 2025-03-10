import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import CustomError from '../helpers/customErrors.js';
// import {validateData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Cart} from '../models/cart.js';
// import {Users} from '../models/users.js';

const getAll = asyncWrapper(async (user) => {
  console.log('Getting cart for user:', user._id);

  if (!user || !user._id) {
    throw new CustomError('User not authenticated properly', 401);
  }

  const cart = await Cart.findOne({userId: user._id}).exec();

  if (!cart) {
    console.log('No cart found for user:', user._id);
    // Instead of throwing an error, return an empty cart
    return {
      userId: user._id,
      items: [],
      total_price: 0
    };
  }

  console.log('Cart found:', cart._id, 'with', cart.items.length, 'items');
  return cart;
});
const updateQuantity = asyncWrapper(async (data, user) => {
  const {bookId, quantity} = data;
  console.log('Update quantity request:', {userId: user._id, bookId, quantity});

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new CustomError('Invalid book ID format', 400);
  }
  if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
    throw new CustomError('Quantity must be a non-negative integer', 400);
  }

  const book = await Books.findById(bookId);

  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  let cart = await Cart.findOne({userId: user._id});

  if (!cart) {
    console.log('No cart found for user, creating new cart');
    // If user doesn't have a cart yet, create one with this item
    if (quantity > 0) {
      if (quantity > book.stock) {
        throw new CustomError(`Only ${book.stock} units available in stock`, 400);
      }

      cart = await Cart.create({
        userId: user._id,
        items: [{bookId: book._id, quantity, price: book.price}],
        total_price: quantity * book.price
      });

      console.log('New cart created:', cart._id);
      return cart;
    } else {
      // If quantity is 0 and no cart exists, just return an empty cart
      return {
        userId: user._id,
        items: [],
        total_price: 0
      };
    }
  }

  const itemIndex = cart.items.findIndex((item) => item.bookId.equals(book._id));

  if (itemIndex === -1) {
    if (quantity > 0) {
      // Item not in cart but quantity > 0, so add it
      if (quantity > book.stock) {
        throw new CustomError(`Only ${book.stock} units available in stock`, 400);
      }

      cart.items.push({bookId: book._id, quantity, price: book.price});
      cart.total_price += quantity * book.price;
    } else {
      // Item not in cart and quantity is 0, do nothing
      throw new CustomError('Item not found in your cart', 404);
    }
  } else {
    const currentItem = cart.items[itemIndex];
    const pricePerItem = currentItem.price;

    if (quantity > book.stock) {
      throw new CustomError(`Only ${book.stock} units available in stock`, 400);
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.total_price -= currentItem.quantity * pricePerItem;
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      const quantityDifference = quantity - currentItem.quantity;
      cart.total_price += quantityDifference * pricePerItem;
      currentItem.quantity = quantity;
    }
  }

  cart.total_price = Math.max(cart.total_price, 0);
  console.log('Saving updated cart:', cart._id);
  await cart.save();
  return cart;
});

const create = asyncWrapper(async (data, user) => {
  console.log('Create cart request:', {userId: user._id, bookId: data.bookId});

  if (!user || !user._id) {
    throw new CustomError('User not authenticated properly', 401);
  }

  if (!data.bookId || !mongoose.Types.ObjectId.isValid(data.bookId)) {
    throw new CustomError('Invalid book ID format', 400);
  }

  const book = await Books.findById(data.bookId);
  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  let cart = await Cart.findOne({userId: user._id});

  if (!cart) {
    console.log('No cart found for user, creating new cart');
    if (book.stock < 1) {
      throw new CustomError('Insufficient stock for this book', 400);
    }

    cart = await Cart.create({
      userId: user._id,
      items: [{bookId: book._id, quantity: 1, price: book.price}],
      total_price: book.price
    });

    console.log('New cart created:', cart._id);
  } else {
    console.log('Existing cart found:', cart._id);
    const existingItemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === book._id.toString()
    );

    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + 1;
      if (newQuantity > book.stock) {
        throw new CustomError('Insufficient stock for this book', 400);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      console.log('Increased quantity for existing item');
    } else {
      if (book.stock < 1) {
        throw new CustomError('Insufficient stock for this book', 400);
      }

      cart.items.push({bookId: book._id, quantity: 1, price: book.price});
      console.log('Added new item to cart');
    }

    cart.total_price += Math.round(book.price, 2);
    console.log('Saving updated cart with new total:', cart.total_price);
    await cart.save();
  }

  return cart;
});

const deleteById = asyncWrapper(async (bookId, user) => {
  console.log('Delete from cart request:', {userId: user._id, bookId});

  if (!user || !user._id) {
    throw new CustomError('User not authenticated properly', 401);
  }

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    throw new CustomError('Invalid book ID format', 400);
  }

  const book = await Books.findById(bookId);
  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  const cart = await Cart.findOne({userId: user._id});
  if (!cart) {
    console.log('No cart found for user');
    throw new CustomError('Cart not found', 404);
  }

  // Check if item exists in cart
  const itemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId.toString());
  if (itemIndex === -1) {
    throw new CustomError('Item not found in your cart', 404);
  }

  // Calculate price of item being removed
  const removedItem = cart.items[itemIndex];
  const priceReduction = removedItem.quantity * removedItem.price;

  // Remove the item from cart
  cart.items = cart.items.filter((item) => item.bookId.toString() !== bookId.toString());

  // Update total price
  cart.total_price = Math.max(0, cart.total_price - priceReduction);

  console.log('Saving cart after item removal, new total:', cart.total_price);
  await cart.save();

  return {
    success: true,
    message: 'Item removed from cart',
    cart
  };
});

export {create, deleteById, getAll, updateQuantity};
