import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  coerceTypes: true,
  removeAdditional: true
});

addFormats(ajv);
addErrors(ajv);

const reviewSchema = {
  type: 'object',
  properties: {
    userid: {type: 'integer', minimum: 1},
    bookid: {type: 'integer', minimum: 1},
    rating: {type: 'integer', minimum: 1, maximum: 5},
    comment: {
      type: 'string',
      minLength: 5,
      maxLength: 500,
      pattern: '^[a-zA-Z0-9 .,!?-]+$',
      errorMessage: {
        pattern: 'Comment contains invalid characters.'
      }
    }
  },
  required: ['userid', 'bookid', 'rating', 'comment'],
  additionalProperties: false
};

const validateReview = ajv.compile(reviewSchema);

const reviewValidationMiddleware = (req, res, next) => {
  const valid = validateReview(req.body);

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validateReview.errors.map((err) => ({
        field: err.instancePath.replace('/', ''),
        message: err.message
      }))
    });
  }

  next();
};

export default reviewValidationMiddleware;
