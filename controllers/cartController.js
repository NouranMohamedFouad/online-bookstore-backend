import mongoose from 'mongoose';
import {asyncWrapper} from '../helpers/asyncWrapper.js';
import CustomError from '../helpers/customErrors.js';
// import {validateData} from '../middlewares/schemaValidator.js';
import {Books} from '../models/books.js';
import {Cart} from '../models/cart.js';
import {Users} from '../models/users.js';

// Helper function to create a virtual ObjectId from a numeric userId or use an existing ObjectId
// This ensures compatibility between different user ID formats in the system
const createVirtualObjectId = (id) => {
  // If id is already an ObjectId instance, return it as is
  if (id instanceof mongoose.Types.ObjectId) {
    console.log('ID is already an ObjectId, using as is:', id);
    return id;
  }
  
  // If id is a valid ObjectId string, convert and return it
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    console.log('ID is a valid ObjectId string, converting:', id);
    return new mongoose.Types.ObjectId(id);
  }

  // Otherwise, treat as a numeric ID and pad it
  try {
    const idStr = id.toString();
    // Then pad with zeros to 24 characters
    const paddedId = idStr.padStart(24, '0');
    console.log('Created virtual ObjectId from numeric ID:', id, 'to', paddedId);
    return new mongoose.Types.ObjectId(paddedId);
  } catch (error) {
    console.error('Error creating virtual ObjectId:', error);
    // If that fails, create a dummy ObjectId as fallback
    const fallbackId = new mongoose.Types.ObjectId();
    console.warn('Using fallback ObjectId:', fallbackId);
    return fallbackId;
  }
};

const getAll = asyncWrapper(async (user) => {
  console.log('Getting cart for user:', user.userId);

  if (!user || !user.userId) {
    throw new CustomError('User not authenticated properly', 401);
  }

  // Better ID handling with logging
  console.log('Original user._id:', user._id);
  console.log('Original user.userId:', user.userId);
  
  // Create a virtual ObjectId with better ID handling
  const virtualObjectId = createVirtualObjectId(user._id || user.userId);
  console.log('Looking for cart with userId:', virtualObjectId);

  // Use populate to include book details in the response
  let cart = await Cart.findOne({userId: virtualObjectId})
    .populate({
      path: 'items.bookId',
      model: 'Books',
      select: 'title author image price category description'
    })
    .exec();
    
  // If not found with virtual ID, try with original user ID
  if (!cart && user._id) {
    console.log('Cart not found with virtual ID, trying with original user._id');
    cart = await Cart.findOne({userId: user._id})
      .populate({
        path: 'items.bookId',
        model: 'Books',
        select: 'title author image price category description'
      })
      .exec();
  }

  if (!cart) {
    console.log('No cart found for user, returning empty cart');
    // Instead of throwing an error, return an empty cart
    return {
      userId: user.userId,
      items: [],
      total_price: 0
    };
  }
  
  console.log('Found cart for user:', cart._id);
  
  // Transform the populated data to match the frontend's expected structure
  const transformedCart = {
    _id: cart._id,
    userId: user.userId, // Use the numeric userId from the user object
    total_price: cart.total_price,
    items: cart.items.map(item => {
      // Check if bookId is null or undefined
      if (!item.bookId) {
        console.warn('Found cart item with null book reference. Item:', item);
        // Return a placeholder for this item
        return {
          bookId: null,
          quantity: item.quantity,
          price: item.price || 0,
          book: {
            _id: null,
            title: 'Unavailable Book',
            author: 'Unknown',
            image: '',
            price: item.price || 0,
            category: '',
            description: 'This book is no longer available'
          }
        };
      }
      
      // Normal case when book reference exists
      return {
        bookId: item.bookId._id,
        quantity: item.quantity,
        price: item.price,
        book: {
          _id: item.bookId._id,
          title: item.bookId.title,
          author: item.bookId.author,
          image: item.bookId.image,
          price: item.bookId.price,
          category: item.bookId.category,
          description: item.bookId.description
        }
      };
    })
  };

  console.log('Cart transformed with book details:', transformedCart._id);
  return transformedCart;
});

const updateQuantity = asyncWrapper(async (data, user) => {
  const {bookId, quantity} = data;
  console.log('Update quantity request:', {userId: user.userId, bookId, quantity});

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new CustomError('Invalid book ID format', 400);
  }
  if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
    throw new CustomError('Quantity must be a non-negative integer', 400);
  }

  // Create a virtual ObjectId from the numeric userId
  const virtualObjectId = createVirtualObjectId(user.userId);

  const book = await Books.findById(bookId);

  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  let cart = await Cart.findOne({userId: virtualObjectId});

  if (!cart) {
    console.log('No cart found for user, creating new cart');
    // If user doesn't have a cart yet, create one with this item
    if (quantity > 0) {
      if (quantity > book.stock) {
        throw new CustomError(`Only ${book.stock} units available in stock`, 400);
      }

      cart = await Cart.create({
        userId: virtualObjectId,
        items: [{bookId: book._id, quantity, price: book.price}],
        total_price: quantity * book.price
      });

      console.log('New cart created:', cart._id);
      return cart;
    } else {
      // If quantity is 0 and no cart exists, just return an empty cart
      return {
        userId: user.userId,
        items: [],
        total_price: 0
      };
    }
  }

  const itemIndex = cart.items.findIndex((item) => item.bookId.equals(book._id));

  if (itemIndex === -1) {
    if (quantity > 0) {
      // Item not in cart but quantity > 0, so add it
      if (quantity > book.stock) {
        throw new CustomError(`Only ${book.stock} units available in stock`, 400);
      }

      cart.items.push({bookId: book._id, quantity, price: book.price});
      cart.total_price += quantity * book.price;
    } else {
      // Item not in cart and quantity is 0, do nothing
      throw new CustomError('Item not found in your cart', 404);
    }
  } else {
    const currentItem = cart.items[itemIndex];
    const pricePerItem = currentItem.price;

    if (quantity > book.stock) {
      throw new CustomError(`Only ${book.stock} units available in stock`, 400);
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.total_price -= currentItem.quantity * pricePerItem;
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      const quantityDifference = quantity - currentItem.quantity;
      cart.total_price += quantityDifference * pricePerItem;
      currentItem.quantity = quantity;
    }
  }

  cart.total_price = Math.max(cart.total_price, 0);
  console.log('Saving updated cart:', cart._id);
  await cart.save();
  // Return populated cart data for consistency
  return getAll(user);
});

const create = asyncWrapper(async (data, user) => {
  console.log('Create cart request:', {userId: user.userId, bookId: data.bookId});

  if (!user || !user.userId) {
    throw new CustomError('User not authenticated properly', 401);
  }

  // Better logging for userId handling
  console.log('Original user._id:', user._id);
  console.log('Original user.userId:', user.userId);
  
  // Create a virtual ObjectId from the user ID, with better logging
  const virtualObjectId = createVirtualObjectId(user._id || user.userId);
  console.log('Using virtual ObjectId for cart:', virtualObjectId);

  if (!data.bookId || !mongoose.Types.ObjectId.isValid(data.bookId)) {
    throw new CustomError('Invalid book ID format', 400);
  }

  const book = await Books.findById(data.bookId);
  if (!book) {
    throw new CustomError('Book not found', 404);
  }

  // Try to find existing cart with better ID handling
  let cart = await Cart.findOne({userId: virtualObjectId});
  
  // If not found, try with original user ID
  if (!cart && user._id) {
    console.log('Cart not found with virtual ID, trying with original _id');
    cart = await Cart.findOne({userId: user._id});
  }

  if (!cart) {
    console.log('No cart found for user, creating new cart');
    if (book.stock < 1) {
      throw new CustomError('Insufficient stock for this book', 400);
    }

    cart = await Cart.create({
      userId: virtualObjectId,
      items: [{bookId: book._id, quantity: 1, price: book.price}],
      total_price: book.price
    });

    console.log('New cart created:', cart._id);
  } else {
    console.log('Existing cart found:', cart._id);
    const existingItemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === book._id.toString()
    );

    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + 1;
      if (newQuantity > book.stock) {
        throw new CustomError('Insufficient stock for this book', 400);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      console.log('Increased quantity for existing item');
    } else {
      if (book.stock < 1) {
        throw new CustomError('Insufficient stock for this book', 400);
      }

      cart.items.push({bookId: book._id, quantity: 1, price: book.price});
      console.log('Added new item to cart');
    }

    cart.total_price += Math.round(book.price, 2);
    console.log('Saving updated cart with new total:', cart.total_price);
    await cart.save();
  }

  // Return populated cart data for consistency
  return getAll(user);
});

const deleteById = asyncWrapper(async (bookId, user) => {
  console.log('Delete from cart request:', {userId: user.userId, bookId});

  if (!user || !user.userId) {
    throw new CustomError('User not authenticated properly', 401);
  }

  // Create a virtual ObjectId from the numeric userId
  const virtualObjectId = createVirtualObjectId(user.userId);

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    throw new CustomError('Invalid book ID format', 400);
  }

  const cart = await Cart.findOne({userId: virtualObjectId});

  if (!cart) {
    console.log('No cart found for user:', user.userId);
    return {
      userId: user.userId,
      items: [],
      total_price: 0,
      success: true,
      message: 'Item removed (cart was already empty)'
    };
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.bookId && item.bookId.toString() === bookId
  );

  if (itemIndex === -1) {
    console.log('Item not found in cart:', bookId);
    // Return success anyway to avoid errors in the UI
    return {
      success: true,
      message: 'Item was already removed',
      data: await getAll(user)
    };
  }

  // Calculate the price to deduct
  const priceToDeduct = cart.items[itemIndex].price * cart.items[itemIndex].quantity;

  // Remove the item
  cart.items.splice(itemIndex, 1);
  
  // Update total price
  cart.total_price = Math.max(0, cart.total_price - priceToDeduct);

  await cart.save();
  console.log('Item removed from cart successfully');

  // Return success with updated cart
  return {
    success: true,
    message: 'Item removed successfully',
    data: await getAll(user)
  };
});

export {create, deleteById, getAll, updateQuantity};
