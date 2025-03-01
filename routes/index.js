import express from 'express';

import BooksRouter from './booksroute.js';
import cartRoutes from './cartRoutes.js';
import OrdersRouter from './ordersRoute.js';
import paymentRoutes from './paymentRoutes.js';

const router = express.Router();

router.use('/books', BooksRouter);
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);
router.use('/orders', OrdersRouter);

export default router;
