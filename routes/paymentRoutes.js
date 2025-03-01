import express from "express";
import { addPayment, getPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/", getPayment);
router.post("/", addPayment);

export default router;
