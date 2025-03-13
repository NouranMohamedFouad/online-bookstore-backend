import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {reset} from '../helpers/resetCounter.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Cart} from '../models/cart.js';
import {Orders, validate} from '../models/orders.js';
import {Users} from '../models/users.js';
import {sendEmail} from '../services/emailService.js';

const create = asyncWrapper(async (user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('user:', user);

    const userCart = await Cart.findOne({userId: user._id});

    console.log('user Cart:', userCart);

    const updatedBooks = [];

    for (const item of userCart.items) {
      const book = await Books.findOne({_id: item.bookId}).session(session);
      if (!book) throw new Error(`Book with ID ${item.bookId} not found`);
      if (book.stock < item.quantity) throw new Error(`Not enough stock for book ID ${item.bookId}`);

      book.stock -= item.quantity;
      await book.save({session});
      updatedBooks.push({bookId: String(book._id), quantity: item.quantity});
    }

    const orderData = {
      userId: user._id.toString(),
      books: updatedBooks,
      totalPrice: userCart.total_price,
      status: 'pending'
    };
    validateData(validate, orderData);

    const order = await Orders.create([orderData], {session});

    if (!user.email) {
      throw new Error(`User with ID ${user.userId} does not have a valid email.`);
    }

    const emailText = `
      Hi ${user.name},

      Great news! Your order has been placed successfully. 🎉

      📦 **Order ID:** ${order[0].orderId}
      💰 **Total Price:** $${userCart.total_price.toFixed(2)}

      Thank you for choosing LitVerse! We appreciate your support and hope you enjoy your books.

      Happy reading! 📚✨

      Best Regards,
      The LitVerse Team
    `;

    await sendEmail(user.email, 'Order Confirmation', emailText);

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
});

const getAll = asyncWrapper(async () => {
  const orders = await Orders.find({}, 'books totalPrice status orderId createdAt').exec();
  const ordersWithBooks = [];
  for (const order of orders) {
    const books = [];
    for (const bookItem of order.books) {
      const book = await Books.findById(bookItem.bookId, 'title price image bookId').exec();
      books.push({
        ...bookItem.toObject(),
        bookDetails: {
          title: book.title,
          price: book.price,
          image: book.image,
          bookId: book.bookId
        }
      });
    }
    ordersWithBooks.push({
      ...order.toObject(),
      books
    });
  }

  return ordersWithBooks;
});

const getById = asyncWrapper(async (id) => {
  const user = await Users.findOne({userId: id}).select('_id').exec();
  const orders = await Orders.find({userId: user._id}, 'books totalPrice status orderId createdAt').exec();
  const ordersWithBooks = [];
  for (const order of orders) {
    const books = [];
    for (const bookItem of order.books) {
      const book = await Books.findById(bookItem.bookId, 'title price image bookId').exec();
      books.push({
        ...bookItem.toObject(),
        bookDetails: {
          title: book.title,
          price: book.price,
          image: book.image,
          bookId: book.bookId
        }
      });
    }
    ordersWithBooks.push({
      ...order.toObject(),
      books
    });
  }
  return ordersWithBooks;
});

const updateOrderStatus = asyncWrapper(async (orderId, status) => {
  const fieldToUpdate = {};
  fieldToUpdate.status = status;

  validatePartialData(validate, fieldToUpdate);

  const order = await Orders.findOneAndUpdate(
    {orderId},
    {status},
    {new: true}
  );
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }
  const user = await Users.findOne({_id: order.userId});
  if (!user) {
    throw new Error(`Order with ID ${user} not found`);
  }
  const emailText = `
    Hi ${user.name},  

    We wanted to update you on your order status. 📢  

    📦 **Order ID:** ${order.orderId}  
    🔄 **Current Status:** ${fieldToUpdate.status.toUpperCase()}  

    We appreciate your patience and support. If you have any questions, feel free to reach out.  

    Thank you for choosing LitVerse! 📚✨  

    Best Regards,  
    The LitVerse Team
  `;

  await sendEmail(user.email, 'Order\'s Status updated', emailText);

  return order;
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
  getById,
  updateOrderStatus
};
