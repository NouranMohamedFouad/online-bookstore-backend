import express from 'express';

import BooksRouter from './books.js';
import UserRouter from './usersRouter.js';

const router = express.Router();

router.use('/books', BooksRouter);
router.use('/users', UserRouter);

export default router;
