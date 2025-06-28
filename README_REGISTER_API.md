# User Registration API

## Overview
The inventory management system now includes a user registration API that allows new users to create accounts.

## API Endpoint

### POST /api/auth/register

Register a new user account.

#### Request Body
```json
{
  "username": "string",
  "password": "string", 
  "name": "string",
  "email": "string",
  "role": "string" // optional, defaults to "staff"
}
```

#### Field Requirements

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| username | string | Yes | 3-30 characters, alphanumeric + underscore only |
| password | string | Yes | Min 6 characters, must contain uppercase, lowercase, and number |
| name | string | Yes | 1-100 characters |
| email | string | Yes | Valid email format |
| role | string | No | "admin", "manager", or "staff" (defaults to "staff") |

#### Response

**Success (201 Created)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "testuser",
      "name": "Test User",
      "email": "test@example.com",
      "role": "staff",
      "isActive": true
    },
    "token": "jwt_token_here",
    "expiresIn": "7d"
  }
}
```

**Validation Error (400 Bad Request)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be between 3 and 30 characters"
    }
  ]
}
```

**Conflict Error (409 Conflict)**
```json
{
  "success": false,
  "message": "Username already exists"
}
```

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "staff"
  }'
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newuser',
    password: 'SecurePass123',
    name: 'New User',
    email: 'newuser@example.com',
    role: 'staff'
  })
});

const data = await response.json();
console.log(data);
```

### Axios Example
```javascript
const axios = require('axios');

const registerData = {
  username: 'newuser',
  password: 'SecurePass123',
  name: 'New User',
  email: 'newuser@example.com',
  role: 'staff'
};

try {
  const response = await axios.post('http://localhost:8080/api/auth/register', registerData);
  console.log('Registration successful:', response.data);
} catch (error) {
  console.error('Registration failed:', error.response.data);
}
```

## Testing

Run the test script to verify the registration API:

```bash
# Make sure the backend server is running
npm start

# In another terminal, run the test
node test-register.js
```

## Security Features

1. **Password Hashing**: Passwords are automatically hashed using bcrypt before storage
2. **Input Validation**: Comprehensive validation for all input fields
3. **Duplicate Prevention**: Checks for existing username and email
4. **JWT Token**: Returns a JWT token for immediate authentication
5. **Role-based Access**: Supports different user roles (admin, manager, staff)

## Error Handling

The API handles various error scenarios:

- **400 Bad Request**: Validation errors (invalid input)
- **409 Conflict**: Username or email already exists
- **500 Internal Server Error**: Server-side errors

## Integration with Frontend

The registration API can be easily integrated with the frontend React application. The returned JWT token can be stored and used for subsequent authenticated requests.

## Notes

- New users are automatically set as active (`isActive: true`)
- The default role is "staff" if not specified
- Passwords must meet security requirements (uppercase, lowercase, number)
- Usernames must be unique and follow the specified pattern
- Email addresses must be unique and valid 