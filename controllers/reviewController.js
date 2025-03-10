import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import CustomError from '../helpers/customErrors.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Review, validate} from '../models/review.js';

const getAll = asyncWrapper(async ({page = 1, limit = 10}) => {
  page = Math.max(Number.parseInt(page, 10) || 1, 1);
  limit = Math.max(Number.parseInt(limit, 10) || 10, 1);

  const [reviews, totalReviews] = await Promise.all([
    Review.find().skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments()
  ]);

  return {
    reviews,
    totalReviews,
    totalPages: Math.max(Math.ceil(totalReviews / limit), 1),
    currentPage: Math.min(page, Math.max(Math.ceil(totalReviews / limit), 1))
  };
});
const getById = asyncWrapper(async (bookId) => {
  // First, find the book by its auto-incremented bookId
  const book = await Books.findOne({bookId});

  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  // Use the ObjectId from the found book to search for reviews
  const bookObjectId = book._id;
  const reviews = await Review.find({bookId: bookObjectId});

  return reviews;
});

// const getById = asyncWrapper(async (bookId) => {
//   const book = await Books.find({bookId});
//   console.log('====================================');
//   console.log(book);
//   console.log('====================================');
//   if (!book) {
//     throw new CustomError('Book not found', 404);
//   }
//   const book_id = new mongoose.Types.ObjectId(book._id);
//   console.log('====================================');
//   console.log(book_id);

//   console.log('====================================');
//   const review = await Review.find({bookId: book._id});

//   return review;
// });

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  return Review.create(data);
});

const updateById = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  validatePartialData(validate, fieldsToUpdate);
  return Review.findOneAndUpdate({reviewId: id}, fieldsToUpdate, {new: true}).lean();
});

const deleteById = asyncWrapper(async (id) => Review.findOneAndDelete({reviewId: id}).lean());

export {create, deleteById, getAll, getById, updateById};
