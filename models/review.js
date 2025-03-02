import dotenv from 'dotenv';
import mongoose, {Schema} from 'mongoose';
import extendMongoose from 'mongoose-schema-jsonschema';
import mongooseSequence from 'mongoose-sequence';
import {compileSchema, convertMongooseSchema} from '../middlewares/schemaValidator.js';

dotenv.config();
extendMongoose(mongoose);

const AutoIncrement = mongooseSequence(mongoose);

const reviewSchema = new Schema(
  {
    reviewId: {
      type: Number,
      unique: true
    },
    userId: {
      type: Number,
      ref: 'Users',
      required: [true, 'UserId is required'],
      index: true
    },
    bookId: {
      type: Number,
      ref: 'Books',
      required: [true, 'BookId is required'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number'
      }
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      minlength: [10, 'Comment must be at least 10 characters']
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.plugin(AutoIncrement, {inc_field: 'reviewId'});
const Review = mongoose.model('Review', reviewSchema);
const jsonSchema = convertMongooseSchema(reviewSchema);
const validate = compileSchema(jsonSchema);

export {Review, validate};
