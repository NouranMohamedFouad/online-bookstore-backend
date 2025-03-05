import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {reset} from '../helpers/resetCounter.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Books, validate} from '../models/books.js';
import {Review} from '../models/review.js';

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const book = await Books.create(data);
  return book;
});

const getAll = asyncWrapper(async () => {
  const booksWithAverageRating = await Books.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: 'bookId',
        foreignField: 'bookId',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        average_rating: {
          $ifNull: [{$avg: '$reviews.rating'}, 0]
        }
      }
    },
    {
      $project: {
        reviews: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0
      }
    }
  ]);

  return booksWithAverageRating;
});

const getById = asyncWrapper(async (id) => {
  const book = await Books.findOne({bookId: id}).exec();

  if (!book) {
    return null;
  }

  const reviews = await Review.find({bookId: id}).exec();

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  const {__v, createdAt, updatedAt, ...bookData} = book.toObject();

  const bookWithAverageRating = {
    ...bookData,
    average_rating: averageRating
  };

  return bookWithAverageRating;
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

    await Review.deleteMany({bookId: deleteBook._id}).session(session);

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
      && key !== 'bookId'
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
