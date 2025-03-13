import express from 'express';
import {OrdersController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';
import {protect, restrictTo} from '../middlewares/authentication.js';

const router = express.Router();

router.post('/', protect, restrictTo('admin', 'customer'), async (req, res, next) => {
  const {status} = req.query;
  const [err, data] = await OrdersController.create(req.user, status);
  if (err) return next(new CustomError(err.message, 422));

  res.json(data);
});

router.get('/', async (req, res, next) => {
  console.log(OrdersController);

  const [err, data] = await OrdersController.getAll();
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.get('/:userId', async (req, res, next) => {
  const {userId} = req.params;
  const [err, data] = await OrdersController.getById(userId);

  if (err) return next(new CustomError(err.message, 422));
  if (!data || data.length === 0) {
    return next(new CustomError('No orders found for this user', 404));
  }
  res.json(data);
});

router.patch('/:id', protect, restrictTo('admin', 'customer'), async (req, res, next) => {
  const {id} = req.params;
  const {status} = req.query;

  if (!status) {
    return next(new CustomError('Status query parameter is required', 400));
  }
  const [err, data] = await OrdersController.updateOrderStatus(id, status);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.delete('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const data = await OrdersController.deleteAll();
    res.json(data);
  } catch (err) {
    next(new CustomError(err.message, 422));
  }
});

router.delete('/:id', protect, restrictTo('admin', 'customer'), async (req, res, next) => {
  try {
    const {id} = req.params;
    const data = await OrdersController.deleteById(id);
    res.json(data);
  } catch (err) {
    next(new CustomError(err.message, 422));
  }
});

export default router;
