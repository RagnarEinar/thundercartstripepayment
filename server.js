const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ✅ Allow CORS from all origins (temporary, update for production)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"], // Allow required methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow required headers
    credentials: true, // Enable if you're using cookies or authentication
  })
);

// Middleware
app.use(express.json()); // Enables parsing of JSON body in requests

app.get("/config", (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISH_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Missing amount or currency" });
    }

    // ✅ Ensure minimum amount
    const minAmount = currency === "INR" ? 5000 : 50; // ₹50 in paise (Stripe uses the smallest unit)
    if (amount < minAmount) {
      return res.status(400).json({
        error: `Amount must be at least ${minAmount / 100} ${currency}`,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("Error creating payment intent:", e);
    res.status(400).json({ error: { message: e.message } });
  }
});

const PORT = process.env.PORT || 5252;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
