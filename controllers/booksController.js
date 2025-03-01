import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Books, validate} from '../models/books.js';

const create = async (data) => {
  validateData(validate, data);
  const book = await Books.create(data);
  return book;
};

const getAll = async () => {
  const books = await Books.find({}).exec();
  return books;
};

export const BooksController = {
  create: asyncWrapper(create),
  getAll: asyncWrapper(getAll)
};
