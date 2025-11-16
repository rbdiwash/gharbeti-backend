# Gharbeti Backend

A comprehensive rental property management system backend API built with Node.js and Express. This system facilitates communication and management between landlords and tenants, handling everything from property listings to payment tracking.

## 🚀 Features

- **Authentication & Authorization**

  - User registration and login
  - JWT-based authentication
  - Password reset functionality
  - Role-based access control (Landlord/Tenant)

- **Property Management**

  - Property listings and management
  - Property details and documentation

- **Tenant Management**

  - Tenant profiles and information
  - Tenant-landlord relationships
  - Document verification

- **Payment System**

  - Rent calculation and tracking
  - Payment history
  - Multiple payment methods (Cash, Bank Transfer, eSewa)
  - Payment verification
  - Due date tracking
  - Late payment detection

- **Lease Agreements**

  - Digital lease agreement management
  - Agreement points and terms

- **Maintenance Requests**

  - Maintenance request submission
  - Request tracking and status updates

- **Communication**

  - Messaging system between landlords and tenants
  - Notifications system
  - Notices and announcements

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API explorer

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gharbeti-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

The Swagger UI provides a complete interface to explore and test all available endpoints.

## 🏗️ Project Structure

```
gharbeti-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection configuration
│   │   └── swagger.js         # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   └── authController.js  # Authentication controllers
│   ├── middleware/
│   │   └── authMiddleware.js  # Authentication middleware
│   ├── models/
│   │   ├── User.js            # User model (Landlord/Tenant)
│   │   ├── Property.js        # Property model
│   │   ├── Payment.js         # Payment model
│   │   ├── LeaseAgreement.js  # Lease agreement model
│   │   ├── Maintenance.js     # Maintenance request model
│   │   ├── Message.js         # Message model
│   │   ├── Notification.js    # Notification model
│   │   ├── Notice.js          # Notice model
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication routes
│   │   ├── user.js            # User management routes
│   │   ├── property.js        # Property routes
│   │   ├── payments.js        # Payment routes
│   │   ├── tenants.js         # Tenant routes
│   │   ├── leaseAgreement.js  # Lease agreement routes
│   │   ├── maintenance.js     # Maintenance routes
│   │   ├── messages.js        # Messaging routes
│   │   ├── notifications.js   # Notification routes
│   │   ├── notices.js         # Notice routes
│   │   └── profile.js          # Profile routes
│   ├── utils/
│   │   ├── generateToken.js   # JWT token generation
│   │   └── rentCalculator.js  # Rent calculation utilities
│   └── index.js               # Application entry point
├── index.js                   # Alternative entry point
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Properties

- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create a new property
- `GET /api/properties/:id` - Get property by ID
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Payments

- `GET /api/payments/tenant/:tenantId/due` - Get rent due for a tenant
- `POST /api/payments` - Record a new payment
- `GET /api/payments/tenant/:tenantId` - Get payment history for a tenant
- `GET /api/payments/landlord/:landlordId` - Get all payments for a landlord
- `POST /api/payments/:paymentId/verify` - Verify a payment

### Tenants

- `GET /api/tenants` - Get all tenants
- `GET /api/tenants/:id` - Get tenant by ID
- `POST /api/tenants` - Create/add a tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Lease Agreements

- `GET /api/lease-agreements` - Get all lease agreements
- `POST /api/lease-agreements` - Create a new lease agreement
- `GET /api/lease-agreements/:id` - Get lease agreement by ID
- `PUT /api/lease-agreements/:id` - Update lease agreement

### Maintenance

- `GET /api/maintenance` - Get all maintenance requests
- `POST /api/maintenance` - Create a maintenance request
- `GET /api/maintenance/:id` - Get maintenance request by ID
- `PUT /api/maintenance/:id` - Update maintenance request

### Messages

- `GET /api/messages` - Get messages
- `POST /api/messages` - Send a message
- `GET /api/messages/:id` - Get message by ID

### Notifications

- `GET /api/notifications/:userId` - Get notifications for a user
- `POST /api/notifications/send` - Send a notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Notices

- `GET /api/notices` - Get all notices
- `POST /api/notices` - Create a notice
- `GET /api/notices/:id` - Get notice by ID
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Profile

- `GET /api/profile/:id` - Get user profile
- `PUT /api/profile/:id` - Update user profile

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 💾 Database Models

### User

- Supports both Landlord and Tenant roles
- Includes payment tracking fields
- Document verification status
- Profile information

### Payment

- Tracks payment amount, date, and method
- Supports multiple payment methods (cash, bank transfer, eSewa)
- Payment verification system
- Transaction ID tracking

### Property

- Property details and information
- Linked to landlords

### Lease Agreement

- Digital lease agreements
- Agreement points and terms

### Maintenance

- Maintenance request tracking
- Status management

## 🧪 Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Environment Variables

Make sure to set up the following environment variables:

- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## 📦 Dependencies

### Core Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Documentation

- **swagger-jsdoc** - Swagger documentation generator
- **swagger-ui-express** - Swagger UI interface

## 🚢 Deployment

The application is configured to run on:

- **Development**: `http://localhost:5000`
- **Production**: `https://gharbeti-backend.onrender.com`

For deployment, ensure:

1. Environment variables are properly set
2. MongoDB connection is configured
3. CORS is configured for your frontend domain
4. Server is listening on `0.0.0.0` (already configured)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name/Team

## 🙏 Acknowledgments

- Built with Express.js and MongoDB
- API documentation powered by Swagger

---

For more information, visit the API documentation at `/api-docs` when the server is running.
