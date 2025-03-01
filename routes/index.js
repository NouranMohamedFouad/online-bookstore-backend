import express from 'express';

import BooksRouter from './books.js';

const router = express.Router();

router.use('/books', BooksRouter);
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);

export default router;
