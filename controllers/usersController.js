import {asyncWrapper} from '../helpers/asyncWrapper.js';
import CustomError from '../helpers/customErrors.js';
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

const getById = asyncWrapper(async (id, user) => {
  if (Number(id) !== user.userId) {
    throw new CustomError('You can only view your own profile', 403);
  }
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
  if (data.password) {
    if (!data.passwordConfirm) {
      throw new CustomError('Please confirm your password', 400);
    }
    if (data.password !== data.passwordConfirm) {
      throw new CustomError('Passwords do not match', 400);
    }
  }

  delete data.passwordConfirm;

  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      fieldsToUpdate[key] = value;
    }
  }

  validatePartialData(validate, fieldsToUpdate);

  let updatedUser = await Users.findOne({userId: id});
  if (!updatedUser) {
    throw new CustomError('User not found', 404);
  }

  if (fieldsToUpdate.password) {
    try {
      updatedUser.password = fieldsToUpdate.password;
      await updatedUser.save();
    } catch (error) {
      throw new CustomError(error.message, 400);
    }
  } else {
    updatedUser = await Users.findOneAndUpdate(
      {userId: id},
      fieldsToUpdate,
      {new: true, runValidators: true}
    );
  }

  return updatedUser;
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
