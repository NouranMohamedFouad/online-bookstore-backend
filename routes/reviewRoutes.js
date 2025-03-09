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
  const [err, data] = await ReviewController.updateById(id, req.body);
  if (!data) return next(new CustomError(err, 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
router.get('/book/:bookId', async (req, res, next) => {
  const {bookId} = req.params;
  console.log('Fetching reviews for book ID:', bookId);

  const [err, data] = await ReviewController.getByBookId(bookId);

  if (err) return next(new CustomError(err.message, 500));
  if (!data || data.length === 0) return next(new CustomError('No reviews found for this book', 404));

  res.json(data);
});

router.delete('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await ReviewController.deleteById(id);

  if (!data) return next(new CustomError('Review Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

export default router;
