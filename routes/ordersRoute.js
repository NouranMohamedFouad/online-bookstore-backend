import express from 'express';
import {OrdersController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const [err, data] = await OrdersController.create(req.body);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.get('/', async (req, res, next) => {
  console.log(OrdersController);
  
  const [err, data] = await OrdersController.getAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
router.get('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  const [err, data] = await OrdersController.getById(userId);

  if (err) return next(new CustomError(err.message, 422));
  if (!data || data.length === 0) {
    return next(new CustomError('No orders found for this user', 404));
  }
  res.json(data);
});

router.delete('/', async (req, res, next) => {
  try {
    const data = await OrdersController.deleteAll();
    res.json(data);
  } catch (err) {
    next(new CustomError(err.message, 500));
  }
});

export default router;
