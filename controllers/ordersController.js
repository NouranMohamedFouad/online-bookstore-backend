import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Orders, validate} from '../models/orders.js';
import {Books} from '../models/books.js';


const create = asyncWrapper(async (data) => {
  validateData(validate, data);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalPrice=0;
    for (const item of data.books) {
      const book = await Books.findById(item.bookId).session(session);
      if (!book) {
        throw new Error(`Book with ID ${item.bookId} not found`);
      }
      if (book.stock < item.quantity) {
        throw new Error(`Not enough stock for book ID ${item.bookId}`);
      }
      book.stock -= item.quantity;
      await book.save({ session });
      totalPrice += item.quantity * book.price;
    }
    const orderData = { ...data, totalPrice };

    const order = await Orders.create([orderData], { session });
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
  const orders = await Orders.find({}).exec();
  return orders;
});

const getById =asyncWrapper( async (id) => {
  const orders = await Orders.find({userId : id}).exec();
  return orders;
});

const deleteAll = async () => {
  const result = await Orders.deleteMany({});
  return result;
};

const deleteById = async () => {
  const result = await Orders.deleteMany({});
  return result;
};
export {
  create,
  getAll,
  deleteAll,
  getById,
  deleteById
};
