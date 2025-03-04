import express from 'express';

import AuthRouter from './authRoutes.js';
import BooksRouter from './booksRoute.js';
import cartRoutes from './cartRoutes.js';
import OrdersRouter from './ordersRoute.js';
import paymentRoutes from './paymentRoutes.js';
import ReviewRouter from './reviewRoutes.js';
import UserRouter from './usersRouter.js';

const router = express.Router();

router.use('/books', BooksRouter);
router.use('/users', UserRouter);
router.use('/reviews', ReviewRouter);
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);
router.use('/orders', OrdersRouter);
router.use('/auth', AuthRouter);

export default router;
