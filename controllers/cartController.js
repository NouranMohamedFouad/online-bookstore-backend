import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
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
const updateById = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '' && key != 'bookId') {
      fieldsToUpdate[key] = value;
    }
  }
  validatePartialData(validate, fieldsToUpdate);
  console.log(fieldsToUpdate);
  console.log(id);
  const updatedReview = await Cart.findOneAndUpdate({cartId: id}, fieldsToUpdate, {new: true});
  return updatedReview;
});

const deleteById = asyncWrapper(async (id) => {
  validateData(validate, id);
  const cart = await Cart.findByIdAndDelete(id);
  return 'Cart deleted successfully';
});

export {create, deleteById, getAll, updateById};
