// import redis from 'redis';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
// import CustomError from '../helpers/customErrors.js'
import {validateData} from '../middlewares/schemaValidator.js';
import {Review,validate} from '../models/review.js';

const getAll =asyncWrapper( async () => {
  const review = await Review.find({}).exec();
  return review;
});

//   const getAll =asyncWrapper( async (data) => {
//   const {page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', rating}=data;
//   const skip = (page - 1) * limit;
//   const filter = {};
//   if (rating) filter.rating = rating;
//   const sortOptions = {};
//   sortOptions[sortBy] = order === 'asc' ? 1 : -1;
//   const reviews = await Review.find(filter)
//     .sort(sortOptions)
//     .skip(skip)
//     .limit(limit).exec();
//  const totalReviews = await Review.countDocuments(filter);
//   return totalReviews;
// });
const getById =asyncWrapper( async (id) => {
  const review = await Review.findOne({reviewId : id}).exec();
  return review;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const review = await Review.create(data);
  return review;
});
const updateById = asyncWrapper(async (id,data) => {
  validateData(validate, data);
  const {rating, comment} = data;
  const updatedReview = await Review.findOneAndUpdate({ reviewId: id },{rating, comment},{new: true});
  return updatedReview;
});
const deleteById = asyncWrapper(async (id) => {
  const deletedReview = await Review.findOneAndDelete({reviewId: id});
  return deletedReview;
});
export {
  getAll,
  create,
  getById,
  updateById,
  deleteById
};
