import express from 'express';
import {UsersController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const [err, data] = await UsersController.create(req.body);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.get('/', async (req, res, next) => {
  const [err, data] = await UsersController.getAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.delete('/', async (req, res, next) => {
  const [err, data] = await UsersController.deleteAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.patch('/:id', async (req, res) => {
});
router.delete('/:id', async (req, res) => {
});
export default router;