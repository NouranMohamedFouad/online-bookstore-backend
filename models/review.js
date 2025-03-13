import dotenv from 'dotenv';
import mongoose, {Schema} from 'mongoose';
import extendMongoose from 'mongoose-schema-jsonschema';
import mongooseSequence from 'mongoose-sequence';
import CustomError from '../helpers/customErrors.js';
import {compileSchema, convertMongooseSchema} from '../middlewares/schemaValidator.js';

dotenv.config();
extendMongoose(mongoose);

const AutoIncrement = mongooseSequence(mongoose);

const reviewSchema = new Schema(
  {
    reviewId: {type: Number, unique: true},
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: [true, 'User ID is required'],
      index: true
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Books',
      required: [true, 'Book ID is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number'
      },
      default: 3
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      minlength: [10, 'Comment must be at least 10 characters']
    },
    lastUpdated: {type: Date, default: Date.now}
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    versionKey: 'version'
  }
);

reviewSchema.plugin(AutoIncrement, {inc_field: 'reviewId'});



reviewSchema.virtual('summary').get(function () {
  return `Rating: ${this.rating}, Comment: ${this.comment.substring(0, 50)}...`;
});

reviewSchema.pre('save', async function (next) {
  const userExists = await mongoose.model('Users').exists({_id: this.userId});
  const bookExists = await mongoose.model('Books').exists({_id: this.bookId});
  if (!userExists || !bookExists) {
    throw new CustomError('Invalid user or book reference');
  }
  next();
});

// reviewSchema.statics.getAverageRating = async function (bookId) {
//   const result = await this.aggregate([
//     {$match: {bookId}},
//     {$group: {_id: null, averageRating: {$avg: '$rating'}}}
//   ]);
//   return result[0]?.averageRating || 0;
// };

const Review = mongoose.model('Review', reviewSchema);
const jsonSchema = convertMongooseSchema(reviewSchema);
const validate = compileSchema(jsonSchema);

export {Review, validate};
