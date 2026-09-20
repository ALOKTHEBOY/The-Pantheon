const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe credentials
const stripeSecret = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_pantheon";
const isMockKey = stripeSecret.includes("placeholder");
const stripe = !isMockKey ? require("stripe")(stripeSecret) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder_key_pantheon";

/**
 * PHASE 2 & 3: PREPARE CHECKOUT
 * Trusted beginning of the checkout lifecycle.
 * Calculates authoritative product prices from Firestore, creates a trusted
 * checkout_sessions record, and initializes the Stripe PaymentIntent.
 */
exports.prepareCheckout = onCall(async (request) => {
  // 1. AUTHENTICATION ENFORCEMENT
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to initiate checkout."
    );
  }

  const { items, shippingDetails } = request.data || {};

  // 2. PAYLOAD VALIDATION
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError("invalid-argument", "The cart cannot be empty.");
  }

  // Validate shipping details
  if (!shippingDetails || typeof shippingDetails !== "object") {
    throw new HttpsError("invalid-argument", "Shipping details are required.");
  }

  const fullName = String(shippingDetails.fullName || "").trim();
  const phone = String(shippingDetails.phone || "").trim();
  const address = String(shippingDetails.address || "").trim();
  const city = String(shippingDetails.city || "").trim();
  const zipCode = String(shippingDetails.zipCode || "").trim();

  if (!fullName || fullName.length > 100) {
    throw new HttpsError("invalid-argument", "Invalid full name in shipping details.");
  }
  if (!phone || phone.length > 25) {
    throw new HttpsError("invalid-argument", "Invalid phone number in shipping details.");
  }
  if (!address || address.length > 300) {
    throw new HttpsError("invalid-argument", "Invalid address in shipping details.");
  }
  if (!city || city.length > 100) {
    throw new HttpsError("invalid-argument", "Invalid city in shipping details.");
  }
  if (!zipCode || zipCode.length > 20) {
    throw new HttpsError("invalid-argument", "Invalid zip code in shipping details.");
  }

  const cleanShipping = { fullName, phone, address, city, zipCode };

  // 3. SERVER-SIDE PRODUCT VERIFICATION & PRICE CALCULATION
  const trustedItems = [];
  let calculatedTotal = 0;
  let verifiedItemsCount = 0;

  for (const item of items) {
    const productId = String(item.productId || "");
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new HttpsError("invalid-argument", "Invalid product or quantity in cart.");
    }

    // Read authoritative product document from Firestore
    const productRef = db.collection("products").doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new HttpsError("not-found", `Product ${productId} is no longer available.`);
    }

    const productData = productSnap.data();
    const authoritativePrice = Number(productData.price);

    if (isNaN(authoritativePrice) || authoritativePrice < 0) {
      throw new HttpsError("internal", `Invalid pricing configuration for product ${productId}.`);
    }

    const lineTotal = authoritativePrice * quantity;
    calculatedTotal += lineTotal;
    verifiedItemsCount += quantity;

    trustedItems.push({
      productId: productId,
      name: String(productData.name || "Artifact"),
      price: authoritativePrice,
      quantity: quantity,
      lineTotal: lineTotal
    });
  }

  // 4. CREATE CHECKOUT SESSION IN FIRESTORE
  const sessionRef = db.collection("checkout_sessions").doc();
  const checkoutSessionId = sessionRef.id;
  const amountInPaise = Math.round(calculatedTotal * 100);

  let paymentIntentId = "";
  let clientSecret = "";

  if (isMockKey) {
    // Isolated local mock mode with placeholder keys
    paymentIntentId = `pi_mock_${checkoutSessionId}`;
    clientSecret = `pi_mock_secret_${checkoutSessionId}_pantheon`;
  } else {
    try {
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountInPaise,
          currency: "inr",
          metadata: {
            checkoutSessionId: checkoutSessionId,
            userId: request.auth.uid
          },
          automatic_payment_methods: {
            enabled: true
          }
        },
        {
          idempotencyKey: checkoutSessionId
        }
      );
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    } catch (err) {
      console.error("Stripe PaymentIntent error:", err);
      throw new HttpsError("internal", `Stripe error: ${err.message}`);
    }
  }

  // Save trusted checkout session snapshot
  await sessionRef.set({
    checkoutSessionId: checkoutSessionId,
    userId: request.auth.uid,
    userEmail: request.auth.token.email || "",
    items: trustedItems,
    itemCount: verifiedItemsCount,
    subtotal: calculatedTotal,
    totalAmount: calculatedTotal,
    currency: "INR",
    shippingDetails: cleanShipping,
    paymentIntentId: paymentIntentId,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  return {
    success: true,
    checkoutSessionId: checkoutSessionId,
    paymentIntentId: paymentIntentId,
    clientSecret: clientSecret,
    subtotal: calculatedTotal,
    total: calculatedTotal,
    currency: "INR",
    isMock: isMockKey
  };
});

/**
 * PHASE 5 & 6: STRIPE WEBHOOK & SERVER FULFILLMENT
 * HTTPS endpoint receiving raw Stripe events. Verifies the cryptographic signature,
 * guarantees idempotency, reads the trusted checkout session, and creates the order.
 */
exports.stripeWebhook = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];

  if (!sig && !isMockKey) {
    console.error("Missing Stripe-Signature header");
    return res.status(400).send("Webhook Error: Missing Stripe-Signature");
  }

  let event;

  try {
    if (!isMockKey && stripe) {
      // Cryptographically verify the event with raw request body
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      // Local development fallback only when placeholder keys are in use
      event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Signature Error: ${err.message}`);
  }

  // Handle successful payments
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const checkoutSessionId = paymentIntent.metadata?.checkoutSessionId;

    if (!checkoutSessionId) {
      console.error("PaymentIntent missing checkoutSessionId metadata:", paymentIntent.id);
      return res.status(400).send("Webhook Error: Missing checkoutSessionId in metadata");
    }

    try {
      // 1. IDEMPOTENCY CHECK: Ensure we never create duplicate orders
      const orderRef = db.collection("orders").doc(paymentIntent.id);
      const existingOrder = await orderRef.get();

      if (existingOrder.exists) {
        console.log(`Order ${paymentIntent.id} already fulfilled (idempotent replay).`);
        return res.status(200).json({ received: true, alreadyFulfilled: true });
      }

      // 2. READ TRUSTED CHECKOUT SESSION
      const sessionRef = db.collection("checkout_sessions").doc(checkoutSessionId);
      const sessionSnap = await sessionRef.get();

      if (!sessionSnap.exists) {
        console.error(`Checkout session ${checkoutSessionId} not found.`);
        return res.status(404).send("Webhook Error: Checkout session not found");
      }

      const sessionData = sessionSnap.data();

      // 3. SECURITY VALIDATION: Match user, amount, and currency
      if (sessionData.userId !== paymentIntent.metadata.userId) {
        console.error("Security validation failed: User ID mismatch between session and PaymentIntent.");
        return res.status(400).send("Security validation failed: User mismatch");
      }

      const expectedPaise = Math.round(sessionData.totalAmount * 100);
      if (Number(paymentIntent.amount) !== expectedPaise) {
        console.error(`Security validation failed: Amount mismatch. Expected ${expectedPaise}, got ${paymentIntent.amount}`);
        return res.status(400).send("Security validation failed: Amount mismatch");
      }

      if (String(paymentIntent.currency).toLowerCase() !== String(sessionData.currency || "inr").toLowerCase()) {
        console.error(`Security validation failed: Currency mismatch. Expected ${sessionData.currency}, got ${paymentIntent.currency}`);
        return res.status(400).send("Security validation failed: Currency mismatch");
      }

      // 4. CREATE AUTHORITATIVE FIRESTORE ORDER
      const nowIso = new Date().toISOString();
      const orderData = {
        id: paymentIntent.id,
        userId: sessionData.userId,
        email: sessionData.userEmail,
        items: sessionData.items, // Authoritative item snapshots
        itemCount: sessionData.itemCount || sessionData.items.reduce((s, i) => s + i.quantity, 0),
        subtotal: sessionData.subtotal,
        totalAmount: sessionData.totalAmount, // Server-calculated true amount
        currency: sessionData.currency || "INR",
        status: "paid",
        paymentStatus: "paid",
        paymentProvider: "stripe_test",
        paymentIntentId: paymentIntent.id,
        checkoutSessionId: checkoutSessionId,
        shippingDetails: sessionData.shippingDetails,
        createdAt: nowIso,
        paidAt: FieldValue.serverTimestamp()
      };

      await orderRef.set(orderData);

      // 5. UPDATE CHECKOUT SESSION STATUS
      await sessionRef.update({
        status: "paid",
        paymentIntentId: paymentIntent.id,
        orderId: paymentIntent.id,
        paidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      // 6. CREATE TRUSTED SERVER NOTIFICATION
      const firstItemName = sessionData.items?.[0]?.name || "artifact";
      const orderNumber = paymentIntent.id.slice(-6).toUpperCase();
      const notifDate = new Date();
      const timeString = notifDate.toLocaleDateString() + " " + notifDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      await db.collection("notifications").add({
        userId: sessionData.userId,
        text: `🎉 Order #${orderNumber} confirmed! Verified payment of ₹${sessionData.totalAmount.toFixed(2)} for ${firstItemName}.`,
        read: false,
        time: timeString,
        timestamp: Date.now(),
        orderId: paymentIntent.id
      });

      console.log(`Successfully minted order ${paymentIntent.id} for user ${sessionData.userId}`);
      return res.status(200).json({ received: true, orderId: paymentIntent.id });
    } catch (fulfillErr) {
      console.error("Error fulfilling order in webhook:", fulfillErr);
      return res.status(500).send(`Fulfillment Error: ${fulfillErr.message}`);
    }
  }

  // Handle failed payments
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const checkoutSessionId = paymentIntent.metadata?.checkoutSessionId;

    if (checkoutSessionId) {
      try {
        await db.collection("checkout_sessions").doc(checkoutSessionId).update({
          status: "failed",
          lastError: paymentIntent.last_payment_error?.message || "Payment declined",
          updatedAt: FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.error("Error updating failed checkout session:", e);
      }
    }
    return res.status(200).json({ received: true, status: "payment_failed_recorded" });
  }

  // Acknowledge receipt of any other unhandled event
  return res.status(200).json({ received: true, ignored: true });
});

/**
 * SIMULATE MOCK FULFILLMENT (FOR LOCAL DEVELOPMENT ONLY)
 * In local mock mode with placeholder Stripe keys where Stripe CLI is not sending
 * webhooks, this callable allows the authenticated user to trigger the server-side
 * fulfillment pipeline to test the exact same order and notification creation.
 */
exports.simulateMockFulfillment = onCall(async (request) => {
  if (!isMockKey) {
    throw new HttpsError("failed-precondition", "Mock simulation is only available when mock keys are active.");
  }

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const { checkoutSessionId } = request.data || {};
  if (!checkoutSessionId) {
    throw new HttpsError("invalid-argument", "checkoutSessionId is required.");
  }

  const sessionRef = db.collection("checkout_sessions").doc(checkoutSessionId);
  const sessionSnap = await sessionRef.get();

  if (!sessionSnap.exists) {
    throw new HttpsError("not-found", "Checkout session not found.");
  }

  const sessionData = sessionSnap.data();
  if (sessionData.userId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "Unauthorized session access.");
  }

  const paymentIntentId = sessionData.paymentIntentId || `pi_mock_${checkoutSessionId}`;
  const orderRef = db.collection("orders").doc(paymentIntentId);
  const existingOrder = await orderRef.get();

  if (existingOrder.exists) {
    return { success: true, orderId: paymentIntentId, alreadyFulfilled: true };
  }

  const nowIso = new Date().toISOString();
  await orderRef.set({
    id: paymentIntentId,
    userId: sessionData.userId,
    email: sessionData.userEmail,
    items: sessionData.items,
    itemCount: sessionData.itemCount || sessionData.items.reduce((s, i) => s + i.quantity, 0),
    subtotal: sessionData.subtotal,
    totalAmount: sessionData.totalAmount,
    currency: sessionData.currency || "INR",
    status: "paid",
    paymentStatus: "paid",
    paymentProvider: "stripe_test_mock",
    paymentIntentId: paymentIntentId,
    checkoutSessionId: checkoutSessionId,
    shippingDetails: sessionData.shippingDetails,
    createdAt: nowIso,
    paidAt: FieldValue.serverTimestamp()
  });

  await sessionRef.update({
    status: "paid",
    orderId: paymentIntentId,
    paidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const firstItemName = sessionData.items?.[0]?.name || "artifact";
  const orderNumber = paymentIntentId.slice(-6).toUpperCase();
  const notifDate = new Date();
  const timeString = notifDate.toLocaleDateString() + " " + notifDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  await db.collection("notifications").add({
    userId: sessionData.userId,
    text: `🎉 Order #${orderNumber} confirmed! Verified payment of ₹${sessionData.totalAmount.toFixed(2)} for ${firstItemName}.`,
    read: false,
    time: timeString,
    timestamp: Date.now(),
    orderId: paymentIntentId
  });

  return { success: true, orderId: paymentIntentId };
});
