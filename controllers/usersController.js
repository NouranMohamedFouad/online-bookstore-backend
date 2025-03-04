import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {reset} from '../helpers/resetCounter.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Users, validate} from '../models/users.js';

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const users = await Users.create(data);
  return users;
});
const getAll = asyncWrapper(async () => {
  const users = await Users.find({}, 'name email role phone').exec();
  return users;
});

const getById = asyncWrapper(async (id) => {
  const users = await Users.findOne({userId: id}, 'name email role phone').exec();
  return users;
});

const deleteAll = asyncWrapper(async () => {
  const result = await Users.deleteMany({});
  await reset('userId');
  console.log('All users deleted and userId counter reset.');
  return result;
});

const update = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      fieldsToUpdate[key] = value;
    }
  }
  validatePartialData(validate, fieldsToUpdate);
  const updatedReview = await Users.findOneAndUpdate({userId: id}, fieldsToUpdate, {new: true});
  return updatedReview;
});

const deleteById = asyncWrapper(async (userId) => {
  const result = await Users.findOneAndDelete({userId});
  return result;
});

export {
  create,
  deleteAll,
  deleteById,
  getAll,
  getById,
  update
};
