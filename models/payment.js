import mongoose from 'mongoose';
import {
  compileSchema,
  convertMongooseSchema
} from '../middlewares/schemaValidator.js';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'paypal'],
    required: [true, 'Payment type is required']
  },
  cardNumber: {
    type: String,
    required() {
      return this.type !== 'paypal';
    },
    match: [/^\d{16}$/, 'Card number must be 16 digits']
  },
  expirationDate: {
    type: Date,
    required() {
      return this.type !== 'paypal';
    },
    validate: {
      validator(value) {
        return value > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  provider: {
    type: String,
    required() {
      return this.type !== 'paypal';
    }
  },
  cvv: {
    type: String,
    required() {
      return this.type !== 'paypal';
    },
    match: [/^\d{3}$/, 'CVV must be 3 digits']
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

const jsonSchema = convertMongooseSchema(paymentSchema);
const validate = compileSchema(jsonSchema);

export {Payment, validate};
