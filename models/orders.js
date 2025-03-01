import mongoose from 'mongoose';
import {compileSchema, convertMongooseSchema} from '../middlewares/schemaValidator.js';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalPrice: {
    type: Number,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Orders = mongoose.model('Order', orderSchema);

const jsonSchema = convertMongooseSchema(orderSchema);
const validate = compileSchema(jsonSchema);

export {Orders, validate};
