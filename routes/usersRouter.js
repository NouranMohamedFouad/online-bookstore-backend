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

router.patch('/:id', async (req, res, next) => {
});
router.delete('/:id', async (req, res, next) => {
  const userId = Number.parseInt(req.params.id);
  console.log('Extracted userId:', userId);  
  const deletedUser = await UsersController.deleteUser(userId);
  if (!deletedUser) return next(new CustomError('User not found', 404));

  res.json({ message: 'User deleted successfully', user: deletedUser });
});
export default router;
