import mongoose from 'mongoose';
import {
  compileSchema,
  convertMongooseSchema
} from '../middlewares/schemaValidator.js';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'User ID is required']
  },
  // bookId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Books',
  //   required: [true, 'Book ID is required']
  // },
  items: {
    type: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Books',
          required: [true, 'Book ID is required in items']
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1']
        },
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price must be a positive number']
        }
      }
    ],
    required: [true, 'Cart items are required'],
    validate: {
      validator(value) {
        return value.length >= 0;
      },
      message: 'Cart must contain at least one item'
    }
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price must be a positive number'],
    validate: {
      validator(value) {
        return (
          value
          >= this.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
        );
      },
      message: 'Total price must match the sum of item prices'
    }
  }
});

const Cart = mongoose.model('Cart', cartSchema);

const jsonSchema = convertMongooseSchema(cartSchema);
const validate = compileSchema(jsonSchema);

export {Cart, validate};
