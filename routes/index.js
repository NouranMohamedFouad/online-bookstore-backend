import express from 'express';

import BooksRouter from './booksRoute.js';

const router = express.Router();

router.use('/books', BooksRouter);

export default router;
