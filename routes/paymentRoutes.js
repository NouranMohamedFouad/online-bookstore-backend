import express from 'express';
import {paymentController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';
import {protect} from '../middlewares/authentication.js';

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

router.get('/config', protect, async (req, res, next) => {
  const [err, config] = await paymentController.getPaymobConfig();
  if (err) return next(new CustomError(err.message, 500));
  res.json(config);
});

router.post('/callback', async (req, res, next) => {
  try {
    const [err, result] = await paymentController.processPaymentCallback(req.body);
    if (err) return next(new CustomError(err.message, 500));
    res.json(result);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    if (req.file) req.body.image = req.file.filename;

    const [err, data] = await paymentController.updateById(id, req.body);
    if (!data) return next(new CustomError('Payment Not Found', 404));
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
  const [err, data] = await paymentController.deleteById(req.params.id);
  if (err) return next(new CustomError(err.message, 404));
  res.json(data);
});

export default router;
