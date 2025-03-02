import {validateData} from '../middlewares/schemaValidator.js';
import {Cart, validate} from '../models/cart.js';
import { asyncWrapper } from '../helpers/asyncWrapper.js';

const getAll =asyncWrapper( async () => {
  const cart = await Cart.find({}).exec();
  return cart;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const cart = await Cart.create(data);
  return cart;
});
export {
  getAll,
  create
};