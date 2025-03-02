/* eslint-disable node/prefer-global/process */
import dotenv from 'dotenv';
import mongoose, {Schema} from 'mongoose';
import extendMongoose from 'mongoose-schema-jsonschema';
import mongooseSequence from 'mongoose-sequence';
import {compileSchema, convertMongooseSchema} from '../middlewares/schemaValidator.js';

dotenv.config();
extendMongoose(mongoose);

const AutoIncrement = mongooseSequence(mongoose);

const reviewSchema = new Schema({
  reviewId: {type: Number, unique: true},
  userId: {type: Number, ref: 'Users', required: true, index: true},
  bookId: {type: Number, ref: 'Books', required: true, index: true},
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  comment: {type: String, trim: true, maxlength: 500}
}, {timestamps: true});

reviewSchema.plugin(AutoIncrement, {inc_field: 'reviewId'});
const Review = mongoose.model('Review', reviewSchema);
const jsonSchema = convertMongooseSchema(reviewSchema);
const validate = compileSchema(jsonSchema);

export {Review, validate};
