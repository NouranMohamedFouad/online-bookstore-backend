# LitVerse Online Bookstore

A full-featured MEAN stack application for an online bookstore, allowing users to browse books, manage their cart, place orders, and administrators to manage inventory.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Backend API](#backend-api)
- [Frontend Components](#frontend-components)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)

## 🔍 Overview

LitVerse is a modern online bookstore platform built using the MEAN stack (MongoDB, Express.js, Angular, Node.js). The application provides a seamless experience for users to browse and purchase books while offering comprehensive management capabilities for administrators.

## ✨ Features

### Customer Features
- **User Authentication**: Secure sign-up, login, and profile management
- **Book Browsing**: Search, filter, and view detailed book information
- **Shopping Cart**: Add, remove, and update book quantities in cart
- **Order Management**: Place orders and track order status
- **Reviews**: Leave and view book reviews
- **Payment Processing**: Secure payment processing interface

### Administrator Features
- **Inventory Management**: Add, update, and remove books
- **Order Management**: View and update order statuses
- **User Management**: View and manage user accounts
- **Real-time Notifications**: WebSocket-based notifications for new orders

## 🛠️ Technology Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **Nodemailer**: Email service integration
- **WebSocket**: Real-time communication
- **Redis**: Caching and session management
- **Winston**: Logging

### Frontend
- **Angular 19**: Frontend framework
- **Bootstrap 5**: CSS framework
- **RxJS**: Reactive Extensions for JavaScript
- **JWT-Decode**: JWT token handling
- **FontAwesome**: Icon library
- **Animate.css & WOW.js**: Animation libraries
- **WebSocket**: Real-time communication

## 🏗️ Architecture

### Backend Architecture
The backend follows a modular MVC (Model-View-Controller) architecture:

- **Models**: MongoDB schemas and validation
- **Controllers**: Business logic handling
- **Routes**: API endpoint definitions
- **Middlewares**: Authentication, validation, error handling
- **Helpers**: Utility functions
- **Services**: External service integrations (email, etc.)

### Frontend Architecture
The frontend is built with Angular, following a component-based architecture:

- **Components**: UI building blocks
- **Services**: Data fetching and business logic
- **Guards**: Route protection
- **Interceptors**: HTTP request/response handling
- **Interfaces**: TypeScript type definitions
- **Pipes**: Data transformation

## 🔌 Backend API

### Authentication Endpoints
- `POST /auth/signup`: Register a new user
- `POST /auth/login`: Authenticate user and receive JWT
- `GET /auth/logout`: Log out current user

### Books Endpoints
- `GET /books`: Get all books (with pagination)
- `GET /books/:id`: Get book by ID
- `POST /books`: Create a new book (admin only)
- `PATCH /books/:id`: Update book by ID (admin only)
- `DELETE /books/:id`: Delete book by ID (admin only)
- `DELETE /books`: Delete all books (admin only)

### Cart Endpoints
- `GET /cart`: Get current user's cart
- `POST /cart`: Add item to cart
- `PATCH /cart`: Update item quantity in cart
- `DELETE /cart/:bookId`: Remove item from cart

### Order Endpoints
- `GET /orders`: Get all orders (admin)
- `GET /orders/:userId`: Get orders by user ID
- `POST /orders`: Create a new order
- `PATCH /orders/:id`: Update order status
- `DELETE /orders/:id`: Delete order by ID
- `DELETE /orders`: Delete all orders (admin only)

### User Endpoints
- `GET /users`: Get all users (admin only)
- `GET /users/:id`: Get user by ID
- `PATCH /users/:id`: Update user by ID
- `DELETE /users/:id`: Delete user by ID
- `DELETE /users`: Delete all users (admin only)

### Review Endpoints
- `GET /reviews`: Get all reviews
- `GET /reviews/:id`: Get review by ID
- `POST /reviews`: Create a new review
- `PATCH /reviews/:id`: Update review by ID
- `DELETE /reviews/:id`: Delete review by ID
- `DELETE /reviews`: Delete all reviews (admin only)

### Payment Endpoints
- `POST /payment`: Process payment

## 🖥️ Frontend Components

### Core Components
- **Header/Footer**: Navigation and site information
- **Home**: Landing page with featured books
- **Book Card**: Reusable book display component
- **Book Details**: Detailed book information view

### User-Focused Components
- **Login/Signup**: User authentication forms
- **User Profile**: User information and settings
- **Cart**: Shopping cart management
- **Payment**: Checkout and payment processing
- **Order Confirmation**: Order success page
- **Orders**: Order history and tracking

### Admin Components
- **Add Book**: Form for adding new books
- **Update Book**: Form for updating existing books
- **Admin Dashboard**: Overview and management interface

## 📥 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- Redis
- Angular CLI

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>

# Navigate to backend directory
cd online-bookstore-backend

# Install dependencies
npm install
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd online_bookstore_ui

# Install dependencies
npm install
```

## ⚙️ Configuration

### Backend Configuration (.env)
```
# Server
PORT=3000

# Database
DB_CONNECTION_STRING=mongodb://localhost:27017/litverse

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Redis
REDIS_PASSWORD=your_redis_password
```

### Frontend Configuration
The frontend configuration is located in `src/environments/environment.ts` and `environment.prod.ts`.

## 🚀 Running the Application

### Running the Backend
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Running the Frontend
```bash
# Development server
npm start

# Build for production
npm run build
```

## 🧪 Testing

### Backend Testing
```bash
npm test
```

### Frontend Testing
```bash
npm test
```

## License
[MIT License](LICENSE) 
