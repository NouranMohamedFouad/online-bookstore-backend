import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import mongoose from 'mongoose';
import extendMongoose from 'mongoose-schema-jsonschema';

extendMongoose(mongoose);

const ajv = new Ajv({allErrors: true, useDefaults: true, coerceTypes: true, strict: false});
addFormats(ajv);

function convertMongooseSchema(mongooseSchema) {
  return mongooseSchema.jsonSchema();
}

function compileSchema(jsonSchema) {
  return ajv.compile(jsonSchema);
}

function validateData(validator, data) {
  const valid = validator(data);
  if (!valid) {
    throw new Error(JSON.stringify(validator.errors, null, 2));
  }
  return data;
}

export {compileSchema, convertMongooseSchema, validateData};
