const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Initialize the Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe (uses .env or fallback placeholder key)
const stripeSecret = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_pantheon";
const isMockKey = stripeSecret.includes("placeholder");
const stripe = !isMockKey ? require("stripe")(stripeSecret) : null;

exports.prepareCheckout = onCall(async (request) => {
  // STEP 1: AUTHENTICATION ENFORCEMENT
  // We do not trust any userId passed in the payload. We rely on the verified Firebase token.
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to initiate checkout."
    );
  }

  const items = request.data.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError("invalid-argument", "The cart cannot be empty.");
  }

  let calculatedTotal = 0;
  let verifiedItemsCount = 0;

  // STEP 2: SERVER-SIDE PRICE CALCULATION
  for (const item of items) {
    // Basic payload validation
    if (!item.productId || typeof item.quantity !== "number" || item.quantity < 1) {
      throw new HttpsError("invalid-argument", "Invalid product payload detected.");
    }

    // Read the authoritative product document from Firestore
    const productRef = db.collection("products").doc(item.productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new HttpsError("not-found", `Product ${item.productId} is no longer available.`);
    }

    const productData = productSnap.data();
    
    // Calculate the line total using the TRUE database price
    calculatedTotal += (productData.price * item.quantity);
    verifiedItemsCount += item.quantity;
  }

  // STEP 3: CREATE PAYMENT INTENT (Stripe Test Mode)
  // Stripe requires amount in smallest currency unit (paise for INR, cents for USD)
  const amountInPaise = Math.round(calculatedTotal * 100);
  let clientSecret = "";

  if (isMockKey) {
    // Local dev mode with placeholder keys: return mock clientSecret
    clientSecret = `pi_mock_secret_${Date.now()}_pantheon_dev`;
  } else {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPaise,
        currency: "inr",
        metadata: {
          userId: request.auth.uid,
          userEmail: request.auth.token.email || "",
          itemCount: String(verifiedItemsCount)
        },
        automatic_payment_methods: {
          enabled: true
        }
      });
      clientSecret = paymentIntent.client_secret;
    } catch (err) {
      throw new HttpsError("internal", `Stripe error: ${err.message}`);
    }
  }

  // STEP 4: RETURN SECURE PAYLOAD WITH CLIENT SECRET
  return {
    success: true,
    currency: "INR",
    itemCount: verifiedItemsCount,
    subtotal: calculatedTotal,
    total: calculatedTotal,
    clientSecret: clientSecret,
    isMock: isMockKey
  };
});
