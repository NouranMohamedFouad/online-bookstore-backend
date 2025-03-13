import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import {reset} from '../helpers/resetCounter.js';
import {validateData, validatePartialData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Cart} from '../models/cart.js';
import {Orders, validate} from '../models/orders.js';
import {Users} from '../models/users.js';
import {sendEmail} from '../services/emailService.js';

// Helper function to handle different ID formats consistently
const ensureObjectId = (id) => {
  // If id is already an ObjectId instance, return it as is
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  
  // If id is a valid ObjectId string, convert and return it
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    return new mongoose.Types.ObjectId(id);
  }

  // Otherwise, treat as a numeric ID and pad it
  try {
    const idStr = id.toString();
    // Then pad with zeros to 24 characters
    const paddedId = idStr.padStart(24, '0');
    return new mongoose.Types.ObjectId(paddedId);
  } catch (error) {
    console.error('Error creating ObjectId from:', id, error);
    // If that fails, create a dummy ObjectId
    return new mongoose.Types.ObjectId();
  }
};

const create = asyncWrapper(async (user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Creating order for user:', user);

    // Validate that we have a user with an ID
    if (!user || (!user._id && !user.userId)) {
      throw new Error('User authentication failed or user ID is missing.');
    }

    // Find the user's cart with better logging
    console.log('Looking for cart with userId:', user._id || user.userId);
    
    // Convert the ID to ensure consistent format
    const userId = ensureObjectId(user._id || user.userId);
    console.log('Converted userId for cart lookup:', userId);
    
    // Try multiple ways to find the cart if the first approach fails
    let userCart = await Cart.findOne({userId: userId}).session(session);
    
    // If not found with the converted ID, try with the original ID
    if (!userCart && user._id) {
      console.log('Cart not found with converted ID, trying original ID');
      userCart = await Cart.findOne({userId: user._id}).session(session);
    }
    
    // If still not found and userId is available, try with that
    if (!userCart && user.userId) {
      console.log('Cart not found with _id, trying with userId:', user.userId);
      const alternativeId = ensureObjectId(user.userId);
      userCart = await Cart.findOne({userId: alternativeId}).session(session);
    }
    
    console.log('User cart found:', userCart);

    // Check if cart exists and has items before proceeding
    if (!userCart) {
      throw new Error('No cart found for this user. Please add items to your cart before placing an order.');
    }

    if (!userCart.items || userCart.items.length === 0) {
      throw new Error('Your cart is empty. Please add items to your cart before placing an order.');
    }

    const updatedBooks = [];

    for (const item of userCart.items) {
      const book = await Books.findOne({_id: item.bookId}).session(session);
      if (!book) throw new Error(`Book with ID ${item.bookId} not found`);
      if (book.stock < item.quantity) throw new Error(`Not enough stock for book ID ${item.bookId}`);

      book.stock -= item.quantity;
      await book.save({session});
      updatedBooks.push({bookId: String(book._id), quantity: item.quantity});
    }

    // Create the order data with strict type checking
    const orderData = {
      userId: String(user._id || user.userId),
      books: updatedBooks.map(book => ({
        bookId: String(book.bookId),
        quantity: Number(book.quantity)
      })),
      totalPrice: Number(userCart.total_price || 0),
      status: 'pending'
    };
    
    console.log('Order data before validation:', orderData);
    
    try {
      validateData(validate, orderData);
    } catch (validationError) {
      console.error('Order validation failed:', validationError);
      throw new Error(`Order validation failed: ${validationError.message}`);
    }

    // Create the order
    const order = await Orders.create([orderData], {session});
    console.log('Order created successfully:', order[0]);

    // Handle email sending gracefully
    try {
      if (!user.email) {
        console.warn(`User with ID ${user._id || user.userId} does not have a valid email.`);
      } else {
        const emailText = `
          Hi ${user.name || 'Valued Customer'},

          Great news! Your order has been placed successfully. 🎉

          📦 **Order ID:** ${order[0].orderId}
          💰 **Total Price:** $${userCart.total_price.toFixed(2)}

          Thank you for choosing LitVerse! We appreciate your support and hope you enjoy your books.

          Happy reading! 📚✨

          Best Regards,
          The LitVerse Team
        `;

        await sendEmail(user.email, 'Order Confirmation', emailText);
      }
    } catch (emailError) {
      // Log the email error but don't fail the transaction
      console.warn('Failed to send order confirmation email:', emailError);
    }

    // Clear the cart after successful order creation
    try {
      userCart.items = [];
      userCart.total_price = 0;
      await userCart.save({session});
      console.log('Cart cleared after successful order');
    } catch (cartError) {
      console.warn('Failed to clear cart after order:', cartError);
      // Don't fail the transaction if cart clearing fails
    }

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    console.error('Order creation failed:', error);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
});

const getAll = asyncWrapper(async () => {
  const orders = await Orders.find({}, 'books totalPrice status orderId createdAt').exec();
  if (!orders || orders.length === 0) {
    return [];
  }
  const ordersWithBooks = [];
  for (const order of orders) {
    const books = [];
    for (const bookItem of order.books) {
      const book = await Books.findById(bookItem.bookId, 'title price image bookId').exec();
      if (!book) {
        continue;
      }
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
  if (!user) {
    return [];
  }
  if (!orders || orders.length === 0) {
    return [];
  }
  for (const order of orders) {
    if (!order.books || order.books.length === 0) {
      continue;
    }
    const books = [];
    for (const bookItem of order.books) {
      const book = await Books.findById(bookItem.bookId, 'title price image bookId').exec();
      if (!book) {
        continue;
      }
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
