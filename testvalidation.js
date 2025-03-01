import mongoose from 'mongoose';
import {compileSchema, validateData} from './middlewares/schemaValidator.js';
import {jsonSchema, Review} from './models/review.js';

// Compile AJV validator
const validateReview = compileSchema(jsonSchema);

// Test function
async function testValidationAndSave() {
  try {
    // Sample valid review data
    const validReview = {
      userid: 123,
      bookid: 456,
      rating: 5,
      comment: 'Great book!'
    };

    // Validate using AJV
    validateData(validateReview, validReview);
    console.log('✅ Validation passed!');

    // Save to MongoDB
    const review = new Review(validReview);
    await review.save();
    console.log('✅ Review saved successfully!');

    // Close connection after testing
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// Run the test
testValidationAndSave();
