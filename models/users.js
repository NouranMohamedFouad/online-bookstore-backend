import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import {compileSchema, convertMongooseSchema} from '../middlewares/schemaValidator.js';

const AutoIncrement = AutoIncrementFactory(mongoose);

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [30, 'Name cannot exceed 30 characters'],
    match: [/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, 'Name should contain only letters and spaces'],
    set: (value) => value.replace(/\b\w/g, (char) => char.toUpperCase())
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
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, 'Password must be 8-32 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)']
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
      minlength: [3, 'Street must be at least 3 characters long']
    },
    city: {
      type: String,
      match: [/^[A-Za-z\s]+$/, 'City should contain only letters and spaces']
    },
    state: {
      type: String,
      match: [/^[A-Za-z\s]+$/, 'State should contain only letters']
    },
    postalCode: {
      type: String,
      match: [/^\d{4,6}$/, 'Postal Code must be 4 to 6 digits']
    },
    country: {
      type: String,
      match: [/^[A-Za-z\s]+$/, 'Country should contain only letters']
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?\d{7,15}$/, 'Invalid phone number format'],
    trim: true
  }
}, {timestamps: true});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre('findOneAndUpdate', async function (next) {
  if (this._update.password) {
    const salt = await bcrypt.genSalt(10);
    this._update.password = await bcrypt.hash(this._update.password, salt);
  }
  next();
});

userSchema.plugin(AutoIncrement, {inc_field: 'userId', start_seq: 1});
const Users = mongoose.model('Users', userSchema);
const jsonSchema = convertMongooseSchema(userSchema);
const validate = compileSchema(jsonSchema);

export {Users, validate};
