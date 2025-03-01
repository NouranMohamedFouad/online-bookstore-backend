import {validateData} from '../middlewares/schemaValidator.js';
import {Books, validate} from '../models/books.js';

const create = async (data) => {
  validateData(validate, data);
  const books = await Books.create(data);

  return books;
};
const getAll = async () => {
  const books = await Books.find({}).exec();
  return books;
};
export {
  create,
  getAll
};
