import bcrypt from 'bcrypt';
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
    if (!data.oldPassword) {
      throw new CustomError('Old password is required', 400);
    }
    if (!data.passwordConfirm) {
      throw new CustomError('Please confirm your password', 400);
    }
    if (data.password !== data.passwordConfirm) {
      throw new CustomError('Passwords do not match', 400);
    }
  }
  const oldPassword = data.oldPassword;
  delete data.oldPassword;
  delete data.passwordConfirm;

  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      fieldsToUpdate[key] = value;
    }
  }

  validatePartialData(validate, fieldsToUpdate);

  let user = await Users.findOne({userId: id}).select('+password');
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  if (fieldsToUpdate.password) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new CustomError('Incorrect old password', 401);
    }

    try {
      user.password = fieldsToUpdate.password;
      await user.save();
    } catch (error) {
      throw new CustomError(error.message, 400);
    }
  } else {
    user = await Users.findOneAndUpdate(
      {userId: id},
      fieldsToUpdate,
      {new: true, runValidators: true}
    );
  }

  return user;
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
