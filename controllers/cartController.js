import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Cart, validate} from '../models/cart.js';

const getAll = asyncWrapper(async () => {
  const cart = await Cart.find({}).exec();
  return cart;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const cart = await Cart.create(data);
  return cart;
});

// delete cart by id
const deleteById = asyncWrapper(async (id) => {
  validateData(validate, id);
  const cart = await Cart.findByIdAndDelete(id);
  return 'Cart deleted successfully';
});

export {create, deleteById, getAll};
