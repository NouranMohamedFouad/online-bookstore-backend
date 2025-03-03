import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Review, validate} from '../models/review.js';

const getAll = asyncWrapper(async ({page = 1, limit = 10}) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const [reviews, totalReviews] = await Promise.all([
    Review.find().skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments()
  ]);

  return {
    reviews,
    totalReviews,
    totalPages: Math.ceil(totalReviews / limit),
    currentPage: page
  };
});

const getById = asyncWrapper(async (id) => {
  const review = await Review.findOne({reviewId: id}).lean();
  return review;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  return await Review.create(data);
});

const updateById = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      fieldsToUpdate[key] = value;
    }
  }
  validatePartialData(validate, fieldsToUpdate);
  const updatedReview = await Review.findOneAndUpdate({reviewId: id}, fieldsToUpdate, {new: true});
  return updatedReview;
});

const deleteById = asyncWrapper(async (id) => {
  const deletedReview = await Review.findOneAndDelete({reviewId: id}).lean();
  return deletedReview;
});

export {create, deleteById, getAll, getById, updateById};
