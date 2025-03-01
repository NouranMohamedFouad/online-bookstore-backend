import express from 'express';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  updateReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', createReview);
router.get('/:reviewId', getReview);
router.get('/', getAllReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

export default router;
