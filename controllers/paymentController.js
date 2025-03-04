import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Payment, validate} from '../models/payment.js';

const getAll = asyncWrapper(async () => {
  const payment = await Payment.find({}).exec();
  return payment;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const payment = await Payment.create(data);
  return payment;
});

// delete payment by id
const deleteById = asyncWrapper(async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  return `Payment deleted successfully${payment}`;
});

export {create, deleteById, getAll};
