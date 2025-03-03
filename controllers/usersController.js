import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Users, validate} from '../models/users.js';

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
  await mongoose.connection.db.collection('counters').drop().catch(err => {
    console.log('Counter collection does not exist, skipping drop.');
  })
  return result;
});
const updateUser = asyncWrapper(async (id, data) => {
  validateData(validate, data);
  const updatedUser = await Users.findByIdAndUpdate(id, data, {new: true});
  return updatedUser;
});
const deleteUser = asyncWrapper(async (userId) => {
  const result = await Users.findOneAndDelete({ userId });
  return result;
});

export {
  create,
  deleteAll,
  deleteUser,
  getAll,
  updateUser
};
