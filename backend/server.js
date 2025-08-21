const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Setup Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_uO9KUIRRmFD0rp",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "ZsmuBYvapWYZ4IkpMRWCZWpo",
});

// ✅ API to create Razorpay order
app.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Amount is required and must be greater than 0" 
      });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    console.log("Creating order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Order created:", order);
    
    res.json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      }
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to create order" 
    });
  }
});

// ✅ API to verify payment signature
app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters"
      });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "ZsmuBYvapWYZ4IkpMRWCZWpo")
      .update(sign.toString())
      .digest("hex");

    console.log("Payment verification:", {
      received_signature: razorpay_signature,
      expected_signature: expectedSign,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });

    if (razorpay_signature === expectedSign) {
      // Fetch payment details from Razorpay
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        console.log("Payment details:", payment);
        
        res.json({ 
          success: true, 
          message: "Payment verified successfully",
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            method: payment.method,
            created_at: payment.created_at
          }
        });
      } catch (fetchError) {
        console.error("Error fetching payment details:", fetchError);
        res.json({ 
          success: true, 
          message: "Payment verified successfully (details fetch failed)",
        });
      }
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: err.message 
    });
  }
});

// ✅ API to get payment details
app.get("/payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        description: payment.description
      }
    });
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Razorpay server is running",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Razorpay server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});