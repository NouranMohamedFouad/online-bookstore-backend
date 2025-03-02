import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Books, validate} from '../models/books.js';

const create = asyncWrapper( async (data) => {
  //valdation 
  validateData(validate, data);
  const book = await Books.create(data);
  return book;
});

const getAll =asyncWrapper( async () => {
  const books = await Books.find({}).exec();
  return books;
});

const deleteAll = asyncWrapper(async () => {
  const result = await Books.deleteMany({});
  return result;
});
export {
  create,
  getAll,
  deleteAll
};
