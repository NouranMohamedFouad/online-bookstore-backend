import process from 'node:process';
import {promisify} from 'node:util';
import jwt from 'jsonwebtoken';
import {validateData} from '../middlewares/schemaValidator.js';
import {sendEmail} from '../services/emailService.js';
import {Users, validate} from './../models/users.js';

const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  if (Number.isNaN(cookieOptions.expires.getTime())) {
    throw new TypeError('option expires is invalid');
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

export const signup = async (req, res, next) => {
  try {
    validateData(validate, req.body);

    const newUser = await Users.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || 'customer',
      address: req.body.address,
      phone: req.body.phone
    });

    await sendEmail(
      newUser.email,
      'Welcome to Our Store!',
      `Hi ${newUser.name},\n\nThank you for signing up! 🎉\nWe're excited to have you.\n\nBest Regards,\nYour Store Team`
    );

    createSendToken(newUser, 201, req, res);
  } catch (err) {
    console.error('Signup error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already exists',
        details: err.keyValue
      });
    }
    if (err.name === 'Error') {
      return res.status(400).json({message: err.message});
    }
    next(err);
  }
};

export const login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({message: 'Please provide email and password!'});
  }

  const user = await Users.findOne({email}).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({message: 'Incorrect email or password'});
  }

  createSendToken(user, 200, req, res);
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({status: 'success'});
};

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization
    && req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({message: 'You are not logged in!'});
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await Users.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({message: 'User does not exist.'});
    }

    if (!['customer', 'admin'].includes(currentUser.role)) {
      return res
        .status(403)
        .json({message: 'No permission to perform this action'});
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({message: 'Invalid token. Please log in!'});
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({message: 'No permission to perform this action'});
    }
    next();
  };
};
