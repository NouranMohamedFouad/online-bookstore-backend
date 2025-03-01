import express from 'express';
import {addToCart, getCart} from '../controllers/cartController.js';

const router = express.Router();

router.get('/', getCart);
router.post('/', addToCart);

export default router;
