import express from 'express';
import {ReviewController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const [err, data] = await ReviewController.create(req.body);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.get('/', async (req, res, next) => {
  const [err, data] = await ReviewController.getAll(req.query);
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
router.get('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await ReviewController.getById(id);
  if (!data) return next(new CustomError('Review Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.put('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await ReviewController.updateById(id,req.body);
  if (!data) return next(new CustomError('Review Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.delete('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await ReviewController.deleteById(id);
  if (!data) return next(new CustomError('Review Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

// router.post('/', createReview);
// router.get('/:reviewId', getReview);
// router.get('/', getAllReviews);
// router.put('/:reviewId', updateReview);
// router.delete('/:reviewId', deleteReview);

export default router;
