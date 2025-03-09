import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import CustomError from '../helpers/customErrors.js';

import {
  compileSchema,
  convertMongooseSchema
} from '../middlewares/schemaValidator.js';

const AutoIncrement = AutoIncrementFactory(mongoose);

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
      match: [
        // eslint-disable-next-line regexp/use-ignore-case
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        'Name should contain only letters and spaces'
      ],
      set: (value) => value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, 'Invalid email format']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      maxlength: [32, 'Password must not exceed 32 characters'],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
        'Password must be 8-32 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
      ]
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
      required: true
    },
    address: {
      street: {
        type: String,
        trim: true,
        minlength: [3, 'Street must be at least 3 characters long'],
        default: undefined
      },
      city: {
        type: String,
        // eslint-disable-next-line regexp/use-ignore-case
        match: [/^[A-Za-z\s]+$/, 'City should contain only letters and spaces'],
        default: undefined
      },
      buildingNo: {
        type: String,
        match: [/^\d+$/, 'Building Number must contain only numbers'],
        default: undefined
      },
      floorNo: {
        type: String,
        match: [/^\d+$/, 'Floor Number must contain only numbers'],
        default: undefined
      },
      flatNo: {
        type: String,
        match: [/^\d+$/, 'Flat Number must contain only numbers'],
        default: undefined
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?\d{7,15}$/, 'Invalid phone number format'],
      trim: true
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordConfirm: {
      type: String,
      required() {
        return this.isNew || this.isModified('password');
      },
      select: false,
      validate: {
        validator(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same'
      }
    }
  },
  {timestamps: true}
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }

  if (!this.isNew && this.isModified('password')) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  const User = mongoose.model('Users');
  if (this.isNew && this.role === 'admin') {
    const adminCount = await User.countDocuments({role: 'admin'});
    console.log(`Admin count: ${adminCount}`);
    if (adminCount >= 5) {
      console.log('Admin limit reached, throwing error');
      return next(new CustomError('Cannot create more than 5 admins', 403));
    }
  }

  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const User = mongoose.model('Users');
  const oldPassword = update.oldPassword;
  delete update.oldPassword;

  if (update.password) {
    if (!oldPassword) {
      return next(new CustomError('Old password is required', 400));
    }

    const existingUser = await User.findOne(this.getQuery()).select('+password');

    if (!existingUser) {
      return next(new CustomError('User not found', 404));
    }

    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isMatch) {
      return next(new CustomError('Incorrect old password', 401));
    }

    update.password = await bcrypt.hash(update.password, 12);
    update.passwordChangedAt = Date.now() - 1000;
  }

  const role = update.role || (update.$set && update.$set.role);
  if (role === 'admin') {
    const adminCount = await User.countDocuments({role: 'admin'});

    const existingUser = await User.findOne(this.getQuery());
    const wasAdmin = existingUser?.role === 'admin';
    if (!wasAdmin && adminCount >= 5) {
      throw new CustomError('Cannot update to admin. Max 5 admins allowed.', 403);
    }
  }
  if (update.address) {
    Object.keys(update.address).forEach((key) => {
      if (update.address[key] === '') {
        update.$unset = update.$unset || {};
        update.$unset[`address.${key}`] = 1;
      }
    });
    next();
  }
});

userSchema.pre(/^find/, function (next) {
  this.find({active: {$ne: false}});
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.plugin(AutoIncrement, {inc_field: 'userId', start_seq: 1});
const Users = mongoose.model('Users', userSchema);
const jsonSchema = convertMongooseSchema(userSchema);
const validate = compileSchema(jsonSchema);

export {Users, validate};
