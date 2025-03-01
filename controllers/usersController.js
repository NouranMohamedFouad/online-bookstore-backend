import {validateData} from '../middlewares/schemaValidator.js';
import {Users, validate} from '../models/users.js';

const create = async (data) => {
  validateData(validate, data);
  const users = await Users.create(data);

  return users;
};
const getAll = async () => {
  const users = await Users.find({}).exec();
  return users;
};
const deleteAll = async () => {
  const result = await Users.deleteMany({});
  return result;
};
export {
  create,
  deleteAll,
  getAll
};
