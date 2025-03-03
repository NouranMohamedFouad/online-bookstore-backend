<<<<<<<<< Temporary merge branch 1
import { validateData } from "../middlewares/schemaValidator.js";
import { Payment, validate } from "../models/payment.js";

export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ userId: req.params.userId });
    if (!payment) return res.status(404).send("Payment not found");
    res.send(payment);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

export const addPayment = async (req, res) => {
  try {
    validateData(validate, req.body);

    const payment = new Payment({ ...req.body });
    await payment.save();
    res.send(payment);
  } catch (error) {
    console.log(error);

    res.status(500).send("Server error");
  }
};
=========
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Payment, validate} from '../models/payment.js';

const getAll =asyncWrapper( async () => {
  const payment = await Payment.find({}).exec();
  return payment;
});

const create = asyncWrapper(async (data) => {
  validateData(validate, data);
  const payment = await Payment.create(data);
  return payment;
});
export {
  getAll,
  create
};

>>>>>>>>> Temporary merge branch 2
