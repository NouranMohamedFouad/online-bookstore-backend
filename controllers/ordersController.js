import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Orders, validate} from '../models/orders.js';

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const orders = await Orders.create(data);

  return orders;
});
const getAll = asyncWrapper(async () => {
  const orders = await Orders.find({}).exec();
  return orders;
});

const deleteAll = async () => {
  const result = await Orders.deleteMany({});
  return result;
};
export {
  create,
  getAll,
  deleteAll
};
