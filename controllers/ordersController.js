import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {reset} from '../helpers/resetCounter.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Orders, validate} from '../models/orders.js';
import {Users} from '../models/users.js';

const create = asyncWrapper(async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await Users.findOne({userId: data.userId}).select('_id').session(session);
    if (!user) {
      throw new Error(`user with ID ${data.userId} not found`);
    }
    let totalPrice = 0;
    const updatedBooks = [];

    for (const item of data.books) {
      const book = await Books.findOne({bookId: item.bookId}).session(session);
      if (!book) {
        throw new Error(`Book with ID ${item.bookId} not found`);
      }

      if (book.stock < item.quantity) {
        throw new Error(`Not enough stock for book ID ${item.bookId}`);
      }
      book.stock -= item.quantity;
      await book.save({session});
      totalPrice += item.quantity * book.price;
      updatedBooks.push({
        bookId: String(book._id),
        quantity: item.quantity
      });
    }
    const orderData = {
      ...data,
      userId: user._id.toString(),
      books: updatedBooks,
      totalPrice,
      status: String(data.status)
    };

    validateData(validate, orderData);

    const order = await Orders.create([orderData], {session});
    await session.commitTransaction();
    session.endSession();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
const getAll = asyncWrapper(async () => {
  const orders = await Orders.find({}, 'books totalPrice status orderId createdAt').exec();
  const ordersWithBooks = [];
  for (const order of orders) {
    const books = [];
    for (const bookItem of order.books) {
      const book = await Books.findById(bookItem.bookId, 'title price image bookId').exec();
      books.push({
        ...bookItem.toObject(),
        bookDetails: {
          title: book.title,
          price: book.price,
          image: book.image,
          bookId: book.bookId
        }
      });
    }
    ordersWithBooks.push({
      ...order.toObject(),
      books
    });
  }

  return ordersWithBooks;
});

const getById = asyncWrapper(async (id) => {
  const user = await Users.findOne({userId: id}).select('_id').exec();
  const orders = await Orders.find({userId: user._id}, 'books totalPrice status orderId').exec();
  const ordersWithBooks = [];
  for (const order of orders) {
    const books = [];
    for (const bookItem of order.books) {
      const book = await Books.findById(bookItem.bookId, 'title price image bookId').exec();
      books.push({
        ...bookItem.toObject(),
        bookDetails: {
          title: book.title,
          price: book.price,
          image: book.image,
          bookId: book.bookId
        }
      });
    }
    ordersWithBooks.push({
      ...order.toObject(),
      books
    });
  }
  return ordersWithBooks;
});

const deleteAll = async () => {
  const result = await Orders.deleteMany({});
  await reset('orderId');
  console.log('All orders deleted and orderId counter reset.');
  return result;
};

const deleteById = async (orderId) => {
  const result = await Orders.findOneAndDelete({orderId});
  if (!result) {
    throw new Error(`Order with orderId ${orderId} not found`);
  }
  return result;
};

export {
  create,
  deleteAll,
  deleteById,
  getAll,
  getById
};
