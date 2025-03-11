import express from 'express';
import {ReviewController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';
import {protect, restrictTo} from '../middlewares/authentication.js';

const router = express.Router();

// Create a new review
router.post('/', protect, async (req, res, next) => {
  try {
    const {_id: userId} = req.user;
    const {bookId} = req.query;

    if (!userId || !bookId) {
      return next(new CustomError('User ID and Book ID are required', 400));
    }

    const [err, data] = await ReviewController.create(req.body, userId, bookId);
    if (err) return next(new CustomError(err.message, 422));

    res.status(201).json(data);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

// Get all reviews
router.get('/', protect,async (req, res, next) => {
  try {
    const [err, data] = await ReviewController.getAll(req.query);
    if (err) return next(new CustomError(err.message, 500));

    res.json(data);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

// Get a single review by ID
router.get('/:id', protect,async (req, res, next) => {
  try {
    const {id} = req.params;
    const [err, data] = await ReviewController.getById(id);

    if (!data) return next(new CustomError('Review Not Found', 404));
    if (err) return next(new CustomError(err.message, 500));

    res.json(data);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const {id} = req.params;
    const [err, data] = await ReviewController.updateById(id, req.body);

    if (!data) return next(new CustomError('Review Not Found', 404));
    if (err) return next(new CustomError(err.message, 500));

    res.json(data);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

// Delete a review by ID
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const {id} = req.params;
    const [err, data] = await ReviewController.deleteById(id);

    if (!data) return next(new CustomError('Review Not Found', 404));
    if (err) return next(new CustomError(err.message, 500));

    res.json({message: 'Review deleted successfully'});
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

export default router;
