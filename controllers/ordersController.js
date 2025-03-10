import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {reset} from '../helpers/resetCounter.js';
import {validateData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Orders, validate} from '../models/orders.js';
import {Users} from '../models/users.js';
import {sendEmail} from '../services/emailService.js';

const create = asyncWrapper(async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await Users.findOne({userId: data.userId}).select('_id').session(session);
    if (!user) {
      throw new Error(`user with ID ${data.userId} not found`);
    }
    let totalPrice = 0;
    const updatedBooks = [];

    for (const item of data.books) {
      const book = await Books.findOne({bookId: item.bookId}).session(session);
      if (!book) {
        throw new Error(`Book with ID ${item.bookId} not found`);
      }

      if (book.stock < item.quantity) {
        throw new Error(`Not enough stock for book ID ${item.bookId}`);
      }
      book.stock -= item.quantity;
      await book.save({session});
      totalPrice += item.quantity * book.price;
      updatedBooks.push({
        bookId: String(book._id),
        quantity: item.quantity
      });
    }
    const orderData = {
      ...data,
      userId: user._id.toString(),
      books: updatedBooks,
      totalPrice,
      status: String(data.status)
    };

    validateData(validate, orderData);

    const order = await Orders.create([orderData], {session});
    await session.commitTransaction();
    session.endSession();

    const emailText = `
      Hi ${user.name},

      Your order has been placed successfully!
      Order ID: ${order[0].orderId}
      Total Price: $${totalPrice.toFixed(2)}

      Thank you for shopping with us!
    `;

    await sendEmail(user.email, 'Order Confirmation', emailText);

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

const getAll = asyncWrapper(async () => {
  const orders = await Orders.find({}, 'books totalPrice status orderId').exec();
  return orders;
});

const getById = asyncWrapper(async (id) => {
  const user = await Users.findOne({userId: id}).select('_id').exec();
  const orders = await Orders.find({userId: user._id}, 'books totalPrice status').exec();
  return orders;
});

const deleteAll = async () => {
  const result = await Orders.deleteMany({});
  await reset('orderId');
  console.log('All orders deleted and orderId counter reset.');
  return result;
};

const deleteById = async (orderId) => {
  const result = await Orders.findOneAndDelete({orderId});
  if (!result) {
    throw new Error(`Order with orderId ${orderId} not found`);
  }
  return result;
};

export {
  create,
  deleteAll,
  deleteById,
  getAll,
  getById
};
