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

const getAll = asyncWrapper(async (page = 1, pageSize = 10) => {
  const skip = (page - 1) * pageSize;

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
    },
    {
      $skip: skip
    },
    {
      $limit: pageSize
    }
  ]);

  return booksWithAverageRating;
});
const getById = asyncWrapper(async (bookId) => {
  const book = await Books.findOne({bookId});

  if (!book) {
    return null;
  }
  const bookObjectId = book._id;
  const reviews = await Review.find({bookId: bookObjectId});

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  const {__v, createdAt, updatedAt, ...bookData} = book.toObject();
  console.log(book);
  const bookWithAverageRating = {
    ...bookData,
    average_rating: averageRating
  };
  return bookWithAverageRating;
});

const deleteAll = asyncWrapper(async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deleteBooksResult = await Books.deleteMany({}).session(session);

    const deleteReviewsResult = await Review.deleteMany({}).session(session);

    await reset('bookId');

    await session.commitTransaction();
    session.endSession();

    console.log('All books and reviews deleted, and bookId counter reset.');
    return {
      booksDeleted: deleteBooksResult.deletedCount,
      reviewsDeleted: deleteReviewsResult.deletedCount
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction aborted due to error:', error.message);
    throw error;
  }
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
