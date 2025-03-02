import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import mongoose from 'mongoose';
import extendMongoose from 'mongoose-schema-jsonschema';

extendMongoose(mongoose);

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  coerceTypes: true,
  strict: false
});

addFormats(ajv);

function convertMongooseSchema(mongooseSchema) {
  const jsonSchema = mongooseSchema.jsonSchema();
  jsonSchema.additionalProperties = false;
  return jsonSchema;
}

function compileSchema(jsonSchema) {
  jsonSchema.additionalProperties = false;
  return ajv.compile(jsonSchema);
}

function validateData(validator, data) {
  const valid = validator(data);
  if (!valid) {
    throw new Error(JSON.stringify(validator.errors, null, 2));
  }
  console.log(data);
  
  return data;
}
function validatePartialData(validator, partialData) {
  const dataToValidate = {...partialData};
  const valid = validator(dataToValidate);

  if (!valid) {
    const relevantErrors = validator.errors.filter((error) => {
      if (error.keyword === 'required' && !(error.params.missingProperty in partialData)) {
        return false;
      }
      return true;
    });

    if (relevantErrors.length > 0) {
      throw new Error(JSON.stringify(relevantErrors, null, 2));
    }
  }

  console.log('Partial Data is Valid:', dataToValidate);
  return dataToValidate;
}

function validatePartialData(validator, partialData) {
  const dataToValidate = { ...partialData };
  const valid = validator(dataToValidate);

  if (!valid) {
    const relevantErrors = validator.errors.filter((error) => {
      if (error.keyword === 'required' && !(error.params.missingProperty in partialData)) {
        return false;
      }
      return true;
    });

    if (relevantErrors.length > 0) {
      throw new Error(JSON.stringify(relevantErrors, null, 2));
    }
  }

  console.log('Partial Data is Valid:', dataToValidate);
  return dataToValidate;
}

export {compileSchema, convertMongooseSchema, validateData,validatePartialData};
export {compileSchema, convertMongooseSchema, validateData, validatePartialData};
