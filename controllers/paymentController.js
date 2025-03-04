import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
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
const updateById = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value !== undefined
      && value !== null
      && value !== ''

    ) {
      fieldsToUpdate[key] = value;
    }
  }
  validatePartialData(validate, fieldsToUpdate);
  console.log(fieldsToUpdate);
  console.log(id);
  const updatedPayment = await Payment.findOneAndUpdate(
    {paymentId: id},
    fieldsToUpdate,
    {new: true}
  );
  return updatedPayment;
});

// delete payment by id
const deleteById = asyncWrapper(async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  return 'Payment deleted successfully';
});

export {create, deleteById, getAll, updateById};
