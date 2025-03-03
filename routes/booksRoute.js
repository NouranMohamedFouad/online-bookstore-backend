import express from 'express';
import {BooksController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const [err, data] = await BooksController.create(req.body);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.get('/', async (req, res, next) => {
  const [err, data] = await BooksController.getAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
router.get('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await BooksController.getById(id);
  if (!data) return next(new CustomError('book Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
router.patch('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await BooksController.updateById(id,req.body);
  if (!data) return next(new CustomError('Book Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.delete('/', async (req, res, next) => {
  const [err, data] = await BooksController.deleteAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.delete('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await BooksController.deleteById(id);
  if (!data) return next(new CustomError('Book Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
export default router;
