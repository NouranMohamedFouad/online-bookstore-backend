import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
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
        minlength: [3, 'Street must be at least 3 characters long']
      },
      city: {
        type: String,
        // eslint-disable-next-line regexp/use-ignore-case
        match: [/^[A-Za-z\s]+$/, 'City should contain only letters and spaces']
      },
      state: {
        type: String,
        // eslint-disable-next-line regexp/use-ignore-case
        match: [/^[A-Za-z\s]+$/, 'State should contain only letters']
      },
      postalCode: {
        type: String,
        match: [/^\d{4,6}$/, 'Postal Code must be 4 to 6 digits']
      },
      country: {
        type: String,
        // eslint-disable-next-line regexp/use-ignore-case
        match: [/^[A-Za-z\s]+$/, 'Country should contain only letters']
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
      required: [true, 'Please confirm your password'],
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
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
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
