import express from 'express';

import BooksRouter from './booksroute.js';
import ReviewRouter from './reviewRoutes.js';

const router = express.Router();

router.use('/books', BooksRouter);
router.use('/reviews', ReviewRouter);

export default router;
