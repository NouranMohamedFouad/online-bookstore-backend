import express from 'express';
import {paymentController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const [err, data] = await paymentController.getAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
router.post('/', async (req, res, next) => {
  const [err, data] = await paymentController.create(req.body);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.delete('/:id', async (req, res, next) => {
  const [err, data] = await paymentController.deleteById(req.params.id);
  if (err) return next(new CustomError(err.message, 404));
  res.json(data);
});

export default router;
