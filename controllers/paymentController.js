const stripe = require("../config/stripe");

exports.processPayment = async (req, res) => {
  try {
    const { amount, currency, paymentMethodId } = req.body;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true, // Automatically confirms the payment
    });

    res.json({ success: true, paymentIntent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
