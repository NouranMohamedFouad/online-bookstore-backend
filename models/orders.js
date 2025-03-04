import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import {compileSchema, convertMongooseSchema} from '../middlewares/schemaValidator.js';

const AutoIncrement = AutoIncrementFactory(mongoose);

const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Books',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      }
    }
  ],
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

orderSchema.set('toJSON', {
  transform: (doc, {__v, ...rest}, options) => rest
});

orderSchema.plugin(AutoIncrement, {inc_field: 'orderId', start_seq: 1});
const Orders = mongoose.model('Order', orderSchema);
const jsonSchema = convertMongooseSchema(orderSchema);
const validate = compileSchema(jsonSchema);

export {Orders, validate};
