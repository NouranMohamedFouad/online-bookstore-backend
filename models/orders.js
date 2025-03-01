import mongoose from 'mongoose';
import {compileSchema} from '../middlewares/schemaValidator.js';

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  total_price: {
    type: Number,
    required: true,
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

const validate = compileSchema (orderSchema);

export default {Orders, validate};
