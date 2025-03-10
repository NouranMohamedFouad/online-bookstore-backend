import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import CustomError from '../helpers/customErrors.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Review, validate} from '../models/review.js';

// Get all reviews with pagination
const getAll = asyncWrapper(async ({page = 1, limit = 10}) => {
  page = Math.max(Number.parseInt(page, 10) || 1);
  limit = Math.max(Number.parseInt(limit, 10) || 10);

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

// Get reviews by book ID
const getById = asyncWrapper(async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new CustomError('Invalid book ID', 400);
  }

  const book = await Books.findById(bookId);
  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  const reviews = await Review.find({bookId: book._id});
  return reviews;
});

// Create a new review
const create = asyncWrapper(async (data, userId, bookId) => {
  const book = await Books.findOne({bookId});
  if (!book) {
    throw new CustomError('Book not found', 404);
  }
  // console.log(book)
  const obj = {...data, userId, bookId: book._id};
  console.log(obj);
  obj.bookId = obj.bookId.toString();
  obj.userId = obj.userId.toString();
  console.log(obj.bookId);
  validateData(validate, obj);
  console.log(obj);
  return Review.create(obj);
});

const updateById = asyncWrapper(async (reviewId, data) => {
  validatePartialData(validate, data);

  console.log('Searching for review with reviewId:', reviewId);
  const review = await Review.findOne({reviewId: Number(reviewId)});

  console.log('Found review:', review);
  console.log('Update Data:', data);

  if (!review) {
    throw new CustomError('Review not found', 404);
  }

  return Review.findOneAndUpdate({reviewId: Number(reviewId)}, data, {new: true}).lean();
});

// Delete a review by ID
const deleteById = asyncWrapper(async (reviewId) => {
  const review = await Review.findOne({reviewId: Number(reviewId)});

  console.log('Found review:', review);

  if (!review) {
    throw new CustomError('Review not found', 404);
  }

  return Review.findOneAndDelete({reviewId: Number(reviewId)}).lean();
});

export {create, deleteById, getAll, getById, updateById};
