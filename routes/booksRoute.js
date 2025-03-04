import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import {BooksController} from '../controllers/index.js';
import CustomError from '../helpers/customErrors.js';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

// Multer configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}${ext}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({storage});
const router = express.Router();

// Serve uploaded images
router.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

const getImageUrl = (req, filename) =>
  filename ? `${req.protocol}://${req.get('host')}/uploads/${filename}` : null;

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return next(new CustomError('Image is required', 400));

    req.body.image = req.file.filename;
    const [err, data] = await BooksController.create(req.body);

    if (err) return next(new CustomError(err.message, 422));

    res.json({
      success: true,
      data,
      imageUrl: getImageUrl(req, req.file.filename)
    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

router.get('/', async (req, res, next) => {
  const [err, books] = await BooksController.getAll();
  if (err) return next(new CustomError(err.message, 500));

  const booksWithImages = books.map((book) => ({
    ...book,
    imageUrl: getImageUrl(req, book.image)
  }));

  res.json(booksWithImages);
});

router.get('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, book] = await BooksController.getById(id);

  if (!book) return next(new CustomError('Book Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));

  res.json({...book, imageUrl: getImageUrl(req, book.image)});
});

router.patch('/:id', upload.single('image'), async (req, res, next) => {
  try {
    const {id} = req.params;
    if (req.file) req.body.image = req.file.filename;

    const [err, data] = await BooksController.updateById(id, req.body);
    if (!data) return next(new CustomError('Book Not Found', 404));
    if (err) return next(new CustomError(err.message, 500));

    res.json({
      success: true,
      data,
      imageUrl: req.file
        ? getImageUrl(req, req.file.filename)
        : getImageUrl(req, data.image)
    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
});

// Delete all books
router.delete('/', async (req, res, next) => {
  const [err, data] = await BooksController.deleteAll();
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

// Delete a book by ID
router.delete('/:id', async (req, res, next) => {
  const {id} = req.params;
  const [err, data] = await BooksController.deleteById(id);
  if (!data) return next(new CustomError('Book Not Found', 404));
  if (err) return next(new CustomError(err.message, 500));
  res.json(data);
});

export default router;
