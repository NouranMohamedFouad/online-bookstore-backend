import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Payment, validate} from '../models/payment.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const getAll = asyncWrapper(async () => {
  const payment = await Payment.find({}).exec();
  return payment;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const payment = await Payment.create(data);
  return payment;
});

const updateById = asyncWrapper(async (id, data) => {
  const fieldsToUpdate = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value !== undefined
      && value !== null
      && value !== ''

    ) {
      fieldsToUpdate[key] = value;
    }
  }
  validatePartialData(validate, fieldsToUpdate);
  console.log(fieldsToUpdate);
  console.log(id);
  const updatedPayment = await Payment.findOneAndUpdate(
    {paymentId: id},
    fieldsToUpdate,
    {new: true}
  );
  return updatedPayment;
});

// delete payment by id
const deleteById = asyncWrapper(async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  return 'Payment deleted successfully';
});

/**
 * Get Paymob configuration from environment variables
 * This keeps API keys secure by not exposing them directly to the frontend
 */
const getPaymobConfig = asyncWrapper(async () => {
  // Ensure all required environment variables are present
  if (!process.env.PAYMOB_API_KEY || 
      !process.env.PAYMOB_INTEGRATION_ID || 
      !process.env.PAYMOB_IFRAME_ID) {
    throw new Error('Missing required Paymob configuration');
  }

  return {
    apiKey: process.env.PAYMOB_API_KEY,
    integrationId: parseInt(process.env.PAYMOB_INTEGRATION_ID, 10),
    iframeId: process.env.PAYMOB_IFRAME_ID,
    // Don't expose the secret key to the frontend
  };
});

/**
 * Process a Paymob payment webhook callback
 * This handles payment notifications from Paymob
 */
const processPaymentCallback = asyncWrapper(async (data) => {
  // Log the webhook data
  console.log('Payment webhook received:', data);

  // Validate the transaction
  if (data.success === 'true' || data.success === true) {
    // Payment was successful, update order status in your database
    // You would typically use data.order.id to find the order
    console.log('Payment successful for order:', data.order.id);
    
    // Return success response
    return {
      success: true,
      message: 'Payment processed successfully'
    };
  } else {
    // Payment failed
    console.error('Payment failed for order:', data.order?.id);
    console.error('Error:', data.error_occured, data.data?.message);
    
    // Return error response
    return {
      success: false,
      message: 'Payment processing failed'
    };
  }
});

export {create, deleteById, getAll, getPaymobConfig, processPaymentCallback, updateById};
