# ROZGAR Razorpay Backend

This is the backend server for handling Razorpay payments in the ROZGAR app.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   - Copy `.env` file and update with your Razorpay credentials
   - For testing, the current test credentials are already configured

3. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Test the Server**
   - Health check: `GET http://localhost:5000/health`
   - Create order: `POST http://localhost:5000/create-order`
   - Verify payment: `POST http://localhost:5000/verify-payment`

## API Endpoints

### 1. Create Order
**POST** `/create-order`

Request body:
```json
{
  "amount": 500,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "worker_name": "John Doe",
    "job_title": "Electrician"
  }
}
```

Response:
```json
{
  "success": true,
  "order": {
    "id": "order_xyz",
    "amount": 50000,
    "currency": "INR",
    "receipt": "receipt_123",
    "status": "created"
  }
}
```

### 2. Verify Payment
**POST** `/verify-payment`

Request body:
```json
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "signature_hash"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "id": "pay_abc",
    "amount": 50000,
    "status": "captured",
    "method": "card"
  }
}
```

### 3. Get Payment Details
**GET** `/payment/:paymentId`

Response:
```json
{
  "success": true,
  "payment": {
    "id": "pay_abc",
    "amount": 50000,
    "status": "captured",
    "method": "card",
    "created_at": 1640995200
  }
}
```

## Security Notes

- Never expose your Razorpay Key Secret in frontend code
- Always verify payment signatures on the backend
- Use HTTPS in production
- Implement rate limiting for production use
- Add proper error handling and logging

## Testing

Use Razorpay's test cards for testing:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date