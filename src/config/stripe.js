// Stripe Configuration
// When you get your real Stripe Test Publishable Key from https://dashboard.stripe.com/test/apikeys,
// replace the placeholder below with: "pk_test_..."
export const STRIPE_PUBLISHABLE_KEY = "pk_test_placeholder_key_pantheon";

export const isStripeConfigured = () => {
  return (
    typeof STRIPE_PUBLISHABLE_KEY === "string" &&
    STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_") &&
    !STRIPE_PUBLISHABLE_KEY.includes("placeholder")
  );
};

