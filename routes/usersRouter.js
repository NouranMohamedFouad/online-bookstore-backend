import express from 'express';
import {UsersController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';
import {protect, restrictTo} from '../middlewares/authentication.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const [err, data] = await UsersController.create(req.body);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.get('/', protect, restrictTo('admin'), async (req, res, next) => {
  const [err, data] = await UsersController.getAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.get('/:id', protect, restrictTo('admin', 'customer'), async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await UsersController.getById(id, req.user);
  if (!data) return next(new CustomError('You can only view your own profile', 403));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.delete('/', protect, restrictTo('admin'), async (req, res, next) => {
  const [err, data] = await UsersController.deleteAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.patch('/:id', protect, restrictTo('customer', 'admin'), async (req, res, next) => {
  const {id} = req.params;
  if (req.user.userId.toString() !== id.toString()) {
    return next(new CustomError('You can only update your own profile', 403));
  }
  const [err, data] = await UsersController.update(id, req.body);
  if (err) return next(new CustomError(err.message, 422));
  if (!data) return next(new CustomError('User not found', 404));
  res.json(data);
});

router.delete('/:id', protect, restrictTo('customer', 'admin'), async (req, res, next) => {
  const userId = Number(req.params.id);
  console.log('Extracted userId:', userId);

  if (Number.isNaN(userId)) {
    return next(new CustomError('Invalid user ID', 400));
  }

  if (req.user.role !== 'admin' && req.user.userId !== userId) {
    return next(new CustomError('You can only delete your own account', 403));
  }

  const deletedUser = await UsersController.deleteById(userId);
  if (!deletedUser) return next(new CustomError('User not found', 404));
  res.json({message: 'User deleted successfully', user: deletedUser});
});
export default router;
