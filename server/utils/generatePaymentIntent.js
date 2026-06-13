import database from "../database/db.js";
import Stripe from "stripe";

export async function generatePaymentIntent(orderId, totalPrice) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      console.error("Stripe Error: STRIPE_SECRET_KEY not set");
      return { success: false, message: "Payment configuration missing." };
    }

    const stripe = new Stripe(secret, {
      apiVersion: "2023-08-16",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
    });

    await database.query(
      "INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [orderId, "Online", "Pending", paymentIntent.client_secret],
    );

    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Payment Error:", error.message || error);
    return { success: false, message: "Payment Failed." };
  }
}
