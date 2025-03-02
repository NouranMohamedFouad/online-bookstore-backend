import {validateData} from '../middlewares/schemaValidator.js';
import {Users, validate} from '../models/users.js';
import {asyncWrapper} from '../helpers/asyncWrapper.js';


const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const users = await Users.create(data);

  return users;
});
const getAll = asyncWrapper(async () => {
  const users = await Users.find({}).exec();
  return users;
});
const deleteAll = asyncWrapper(async () => {
  const result = await Users.deleteMany({});
  return result;
});
export {
  create,
  deleteAll,
  getAll
};