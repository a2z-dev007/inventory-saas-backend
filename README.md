# Inventory Management System Backend

A complete, production-ready backend for inventory management built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete CRUD operations with role management
- **Product Management**: Full product lifecycle with stock tracking
- **Purchase Orders**: Create, approve, and track purchase orders
- **Sales Management**: Invoice generation and sales tracking
- **Purchase Recording**: Vendor purchase tracking with file uploads
- **Vendor & Customer Management**: Complete contact management
- **Reporting**: Comprehensive business reports
- **Security**: Helmet, rate limiting, input validation
- **Documentation**: Swagger/OpenAPI documentation
- **Logging**: Winston-based logging system

## 📋 Prerequisites

- Node.js 18+ LTS
- MongoDB 6.0+
- npm or yarn

## 🛠 Installation

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd inventory-management-backend
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Environment Setup**
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. **Start MongoDB**
\`\`\`bash
# Make sure MongoDB is installed and running locally
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
\`\`\`

5. **Seed the database**
\`\`\`bash
npm run seed
\`\`\`

6. **Start development server**
\`\`\`bash
npm run dev
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/inventory_management |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |
| `MAX_FILE_SIZE` | Max upload file size | 5242880 (5MB) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

### Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Staff | staff | staff123 |

## 🔐 Authentication

All API endpoints (except login and health check) require authentication via JWT token.

**Login Request:**
\`\`\`bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
\`\`\`

**Using the token:**
\`\`\`bash
Authorization: Bearer <your-jwt-token>
\`\`\`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin/Manager)
- `POST /api/users` - Create user (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin/Manager)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PATCH /api/products/:id/stock` - Update stock (Admin/Manager)

### Purchase Orders
- `GET /api/purchase-orders` - Get all POs
- `POST /api/purchase-orders` - Create PO (Admin/Manager)
- `GET /api/purchase-orders/:id` - Get PO by ID
- `PUT /api/purchase-orders/:id` - Update PO (Admin/Manager)
- `DELETE /api/purchase-orders/:id` - Delete PO (Admin)
- `PATCH /api/purchase-orders/:id/status` - Update status

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale by ID
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale (Admin)

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Create purchase (Admin/Manager)
- `GET /api/purchases/:id` - Get purchase by ID
- `PUT /api/purchases/:id` - Update purchase (Admin/Manager)
- `DELETE /api/purchases/:id` - Delete purchase (Admin)

### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create vendor (Admin/Manager)
- `GET /api/vendors/:id` - Get vendor by ID
- `PUT /api/vendors/:id` - Update vendor (Admin/Manager)
- `DELETE /api/vendors/:id` - Delete vendor (Admin)

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (Admin)

### Reports
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/purchases` - Purchase reports
- `GET /api/reports/inventory` - Inventory reports
- `GET /api/reports/dashboard` - Dashboard summary

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Manager, Staff roles
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevent API abuse
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection Prevention**: Mongoose ODM protection

## 📈 Performance Features

- **Pagination**: All list endpoints support pagination
- **Indexing**: Optimized database indexes
- **Caching**: Ready for Redis integration
- **Compression**: Gzip compression enabled
- **Logging**: Structured logging with Winston

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
\`\`\`

## 📝 Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set strong `JWT_SECRET`
   - Configure production `MONGODB_URI`
   - Set `NODE_ENV=production`
   - Configure proper `CORS_ORIGIN`

2. **Security**
   - Enable HTTPS
   - Configure firewall
   - Set up monitoring
   - Regular backups

3. **Performance**
   - Enable MongoDB replica set
   - Configure load balancer
   - Set up CDN for static files
   - Monitor performance metrics

### Traditional Deployment

\`\`\`bash
# Install dependencies
npm ci --only=production

# Set environment variables
export NODE_ENV=production
export MONGODB_URI=your_production_mongodb_uri
export JWT_SECRET=your_production_jwt_secret

# Start the application
npm start
\`\`\`

### Process Manager (PM2)

\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "inventory-api"

# Save PM2 configuration
pm2 save
pm2 startup
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@inventory.com
- Documentation: http://localhost:5000/api-docs

## 🔄 Version History

- **v1.0.0** - Initial release with complete inventory management features
