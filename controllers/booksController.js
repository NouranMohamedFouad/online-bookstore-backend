import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {reset} from '../helpers/resetCounter.js';
import {
  validateData,
  validatePartialData
} from '../middlewares/schemaValidator.js';
import {Books, validate} from '../models/books.js';
import {Review} from '../models/review.js';

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  console.log(data);

  const book = await Books.create(data);
  return book;
});

const getAll = asyncWrapper(async () => {
  const books = await Books.find({}).exec();
  return books;
});

const getById = asyncWrapper(async (id) => {
  const books = await Books.findOne({bookId: id}).exec();
  return books;
});
const deleteAll = asyncWrapper(async () => {
  const result = await Books.deleteMany({});
  await reset('bookId');
  console.log('All books deleted and bookID counter reset.');
  return result;
});

const deleteById = asyncWrapper(async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deleteBook = await Books.findOneAndDelete({bookId: id}).session(
      session
    );

    if (!deleteBook) {
      throw new Error('Book not found');
    }

    await Review.deleteMany({bookId: id}).session(session);

    await session.commitTransaction();
    session.endSession();

    return deleteBook;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

const updateById = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value !== undefined
      && value !== null
      && value !== ''
      && key != 'bookId'
    ) {
      fieldsToUpdate[key] = value;
    }
  }
  validatePartialData(validate, fieldsToUpdate);
  console.log(fieldsToUpdate);
  console.log(id);
  const updatedReview = await Books.findOneAndUpdate(
    {bookId: id},
    fieldsToUpdate,
    {new: true}
  );
  return updatedReview;
});

export {create, deleteAll, deleteById, getAll, getById, updateById};
