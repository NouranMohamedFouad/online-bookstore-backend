import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import {
  compileSchema,
  convertMongooseSchema
} from '../middlewares/schemaValidator.js';

const AutoIncrement = AutoIncrementFactory(mongoose);

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: Number,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      minlength: 3,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be positive']
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative']
    },
    image: {
      type: String,
      validate: {
        validator(v) {
          return /\.(?:jpg|jpeg|png|gif)$/i.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid image file extension!`
      }
    },
    category: {
      type: String,
      enum: [
        'Fiction',
        'Non-fiction',
        'Science',
        'History',
        'Fantasy',
        'Biography',
        'Other'
      ],
      required: true
    }
  },
  {
    timestamps: true
  }
);

bookSchema.set('toJSON', {
  transform: (doc, {__v, ...rest}, options) => rest
});

bookSchema.plugin(AutoIncrement, {inc_field: 'bookId', start_seq: 1});

const Books = mongoose.model('Books', bookSchema);

const jsonSchema = convertMongooseSchema(bookSchema);
const validate = compileSchema(jsonSchema);

export {Books, validate};
