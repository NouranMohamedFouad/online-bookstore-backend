/* eslint-disable node/prefer-global/process */
import mongoose, {Schema} from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

mongoose.connect(process.env.DB_CONNECTION_STRING);
const AutoIncrement = mongooseSequence(mongoose);

const reviewSchema = new Schema({
  reviewid: {type: Number, unique: true},
  userid: {type: Number, ref: 'User', index: true},
  bookid: {type: Number, ref: 'Book', index: true},
  rating: {type: Number},
  comment: {type: String, trim: true}
});

reviewSchema.plugin(AutoIncrement, {inc_field: 'reviewid'});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
