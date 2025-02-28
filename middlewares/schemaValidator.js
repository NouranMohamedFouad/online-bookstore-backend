import Ajv from 'ajv';

const ajv = new Ajv({allErrors: true, useDefaults: true, coerceTypes: true});

function compileSchema(schema) {
  return ajv.compile(schema);
}

function validateData(validator, data) {
  const valid = validator(data);
  if (!valid) {
    throw new Error(JSON.stringify(validator.errors, null, 2));
  }
  return data;
}

export default {compileSchema, validateData};
