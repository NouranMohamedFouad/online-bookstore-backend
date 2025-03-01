/* eslint-disable node/prefer-global/process */
import dotenv from 'dotenv';
import mongoose, {Schema} from 'mongoose';
import extendMongoose from 'mongoose-schema-jsonschema';
import mongooseSequence from 'mongoose-sequence';

dotenv.config();
extendMongoose(mongoose);

const DB_URI = process.env.DB_CONNECTION_STRING;
if (!DB_URI) {
  throw new Error('Database connection string is missing.');
}

mongoose.connect(DB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const AutoIncrement = mongooseSequence(mongoose);

const reviewSchema = new Schema({
  reviewid: {type: Number, unique: true},
  userid: {type: Number, ref: 'Users', required: true, index: true},
  bookid: {type: Number, ref: 'Books', required: true, index: true},
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

reviewSchema.plugin(AutoIncrement, {inc_field: 'reviewid'});

const jsonSchema = reviewSchema.jsonSchema();
const Review = mongoose.model('Review', reviewSchema);

export {jsonSchema, Review};
