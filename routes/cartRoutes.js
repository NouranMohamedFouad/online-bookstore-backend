import express from 'express';
import {
  addItemToCart,
  removeItemFromCart,
  showCartItems
} from '../controllers/cartController.js';
import {CartController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

import {protect, restrictTo} from '../middlewares/authentication.js';

const router = express.Router();

router.get('/', protect, restrictTo('customer'), async (req, res, next) => {
  const [err, data] = await CartController.getAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});
router.post('/', async (req, res, next) => {
  const [err, data] = await CartController.create(req.body);
  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});
router.patch('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    if (req.file) req.body.image = req.file.filename;

    const [err, data] = await CartController.updateById(id, req.body);
    if (!data) return next(new CustomError('Cart Not Found', 404));
    if (err) return next(new CustomError(err.message, 500));

    res.json({
      success: true,
      data

    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

router.delete('/:id', async (req, res, next) => {
  const [err, data] = await CartController.deleteById(req.params.id);
  if (err) return next(new CustomError(err.message, 404));
  res.json(data);
});

router.post('/add', addItemToCart);
router.delete('/remove', removeItemFromCart);
router.get('/:userId', showCartItems);

export default router;
