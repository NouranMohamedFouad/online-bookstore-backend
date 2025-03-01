import redis from 'redis';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {Review} from '../models/review.js';

const client = redis.createClient();

export const createReview = asyncWrapper(async (req, res) => {
  const {userId, bookId, rating, comment} = req.body;

  const newReview = await Review.create({userId, bookId, rating, comment});

  const cacheKey = `review:${newReview.reviewId}`;
  client.set(cacheKey, JSON.stringify(newReview), 'EX', 3600);

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: newReview
  });
});

export const getReview = asyncWrapper(async (req, res) => {
  const {reviewId} = req.params;

  const cacheKey = `review:${reviewId}`;
  const cachedReview = await client.get(cacheKey);

  if (cachedReview) {
    return res.status(200).json({
      success: true,
      message: 'Review retrieved successfully (cached)',
      data: JSON.parse(cachedReview)
    });
  }

  const review = await Review.findOne({reviewId});

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  client.set(cacheKey, JSON.stringify(review), 'EX', 3600);

  res.status(200).json({
    success: true,
    message: 'Review retrieved successfully',
    data: review
  });
});

export const getAllReviews = asyncWrapper(async (req, res) => {
  const {page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', rating} = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (rating) filter.rating = rating;

  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const reviews = await Review.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'All reviews retrieved successfully',
    data: reviews,
    pagination: {
      page,
      limit,
      total: totalReviews
    }
  });
});

export const updateReview = asyncWrapper(async (req, res) => {
  const {reviewId} = req.params;
  const {rating, comment} = req.body;

  const updatedReview = await Review.findOneAndUpdate(
    {reviewId},
    {rating, comment},
    {new: true}
  );

  if (!updatedReview) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const cacheKey = `review:${reviewId}`;
  client.set(cacheKey, JSON.stringify(updatedReview), 'EX', 3600);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: updatedReview
  });
});

export const deleteReview = asyncWrapper(async (req, res) => {
  const {reviewId} = req.params;

  const deletedReview = await Review.findOneAndDelete({reviewId});

  if (!deletedReview) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const cacheKey = `review:${reviewId}`;
  client.del(cacheKey);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
    data: deletedReview
  });
});
