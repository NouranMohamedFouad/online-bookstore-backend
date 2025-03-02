import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Payment, validate} from '../models/payment.js';

const getAll =asyncWrapper( async () => {
  const payment = await Payment.find({}).exec();
  return payment;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const payment = await Payment.create(data);
  return payment;
});
export {
  getAll,
  create
};

