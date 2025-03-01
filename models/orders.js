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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
orderSchema.set('toJSON', {
  transform: (doc, {__v, ...rest}, options) => rest
});

>>>>>>> e02ecffcefef3d510bca0823d76a6dc10ee6a7a5
orderSchema.plugin(AutoIncrement, {inc_field: 'orderId', start_seq: 1});
const Orders = mongoose.model('Order', orderSchema);
const jsonSchema = convertMongooseSchema(orderSchema);
const validate = compileSchema(jsonSchema);

export {Orders, validate};
=======
=======
>>>>>>> 70bf629 (add orders controllers and routes)
const Orders = mongoose.model('Order', orderSchema);

const jsonSchema = convertMongooseSchema(orderSchema);
const validate = compileSchema(jsonSchema);

export {Orders, validate};
<<<<<<< HEAD
>>>>>>> 84c7ca3aa00303067b15ca7007e4b9ceb6c8d1ca
=======
>>>>>>> 70bf629 (add orders controllers and routes)
