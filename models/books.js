import mongoose from 'mongoose';
import {compileSchema} from '../middlewares/schemaValidator.js';

const bookSchema = new mongoose.Schema({
  book_id: {
    type: Number,
    required: true,
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
        return /^(?:http|https):\/\/.*\.(?:jpg|jpeg|png|gif)$/i.test(v);
      },
      message: (props) => `${props.value} is not a valid image URL!`
    }
  },
  category: {
    type: String,
    enum: ['Fiction', 'Non-fiction', 'Science', 'History', 'Fantasy', 'Biography', 'Other'],
    required: true
  },
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

const Books = mongoose.model('Books', bookSchema);

const validate = compileSchema (bookSchema);

export default {Books, validate};
