import mongoose from 'mongoose';
import {compileSchema} from '../middlewares/schemaValidator.js';

const orderItemSchema = new mongoose.Schema({
  orderItem_id: {
    type: Number,
    required: true,
    unique: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

const validate = compileSchema (orderItemSchema);

export default {OrderItem, validate};
