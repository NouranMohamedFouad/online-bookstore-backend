import express from 'express';
import {UsersController} from '../controllers/index.js';
import {asyncWrapper} from '../helpers.js';

class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
const router = express.Router();

router.post('/', async (req, res, next) => {
  const [err, data] = await asyncWrapper(UsersController.create(req.body));

  if (!err) return res.json(data);

  next(new CustomError(err.message, 422));
});
router.get('/', async (req, res) => {
  const employees = await UsersController.getAll();
  res.json(employees);
});
router.delete('/', async (req, res, next) => {
  try {
    const data = await UsersController.deleteAll();
    res.json(data);
  } catch (err) {
    next(new CustomError(err.message, 500));
  }
});
router.patch('/:id', async (req, res) => {
});
router.delete('/:id', async (req, res) => {
});
export default router;
