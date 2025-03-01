import express from "express";

<<<<<<< HEAD
import BooksRouter from "./booksroute.js";
import cartRoutes from "./cartRoutes.js";
import OrdersRouter from "./ordersRoute.js";
import paymentRoutes from "./paymentRoutes.js";
import ReviewRouter from "./reviewRoutes.js";

const router = express.Router();

router.use("/books", BooksRouter);
router.use("/reviews", ReviewRouter);
router.use("/cart", cartRoutes);
router.use("/payment", paymentRoutes);
router.use("/orders", OrdersRouter);
=======
import BooksRouter from './books.js';
import UserRouter from './usersRouter.js';

const router = express.Router();

router.use('/books', BooksRouter);
router.use('/users', UserRouter);
>>>>>>> 3fe66c7 (edits)

export default router;
