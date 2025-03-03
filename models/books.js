import mongoose from 'mongoose';
import { compileSchema, convertMongooseSchema } from '../middlewares/schemaValidator.js';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const bookSchema = new mongoose.Schema({
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

// Apply the auto-increment plugin to the schema
bookSchema.plugin(AutoIncrement, { inc_field: 'bookId', start_seq: 1 });

const Books = mongoose.model('Books', bookSchema);

const jsonSchema = convertMongooseSchema(bookSchema);
const validate = compileSchema(jsonSchema);

export { Books, validate };