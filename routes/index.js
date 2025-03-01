import express from 'express';

import BooksRouter from './booksroute.js';
<<<<<<< HEAD
import ReviewRouter from './reviewRoutes.js';
=======
import cartRoutes from './cartRoutes.js';
import OrdersRouter from './ordersRoute.js';
import paymentRoutes from './paymentRoutes.js';
>>>>>>> 70bf6293b685227bba38bb8bda044a36f47a520c

const router = express.Router();

router.use('/books', BooksRouter);
<<<<<<< HEAD
router.use('/reviews', ReviewRouter);
=======
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);
router.use('/orders', OrdersRouter);
>>>>>>> 70bf6293b685227bba38bb8bda044a36f47a520c

export default router;
