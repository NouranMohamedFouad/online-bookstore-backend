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

router.get('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await UsersController.getById(id);
  if (!data) return next(new CustomError('User Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.delete('/', async (req, res, next) => {
  const [err, data] = await UsersController.deleteAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.patch('/:id', async (req, res, next) => {
  const {id} = req.params;
  console.log('Updating user with ID:', id);
  const [err, data] = await UsersController.update(id, req.body);
  if (err) return next(new CustomError(err.message, 422));
  if (!data) return next(new CustomError('User not found', 404));
  res.json(data);
});

router.delete('/:id', async (req, res, next) => {
  const userId = Number.parseInt(req.params.id);
  console.log('Extracted userId:', userId);
  const deletedUser = await UsersController.deleteById(userId);
  if (!deletedUser) return next(new CustomError('User not found', 404));
  res.json({message: 'User deleted successfully', user: deletedUser});
});
// router.post('/login', async (req, res, next) => {
//   const [err, data] = await asyncWrapper(UsersController.login(req.body));
//   if (!err) return res.json({token: data});

//   next(err);
// });
export default router;
