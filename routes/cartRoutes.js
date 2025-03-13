import express from 'express';

// import {
//   removeItemFromCart,
//   showCartItems
// } from '../controllers/cartController.js';
import {CartController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

import {protect} from '../middlewares/authentication.js';

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  const [err, data] = await CartController.getAll(req.user);
  // console.log(req.user);
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

router.patch('/', protect, async (req, res, next) => {
  try {
    const [err, data] = await CartController.updateQuantity(req.body, req.user);
    if (err) return next(new CustomError(err.message, 500));
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});
router.post('/', protect, async (req, res, next) => {
  const [err, data] = await CartController.create(req.body, req.user);

  if (err) return next(new CustomError(err.message, 422));
  res.json(data);
});

router.delete('/:id', protect, async (req, res, next) => {
  const [err, data] = await CartController.deleteById(req.params.id, req.user);
  if (err) return next(new CustomError(err.message, 404));
  res.json(data);
});

// router.post('/add', addItemToCart);
// router.delete('/remove', removeItemFromCart);
// router.get('/:userId', showCartItems);

export default router;
