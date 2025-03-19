import { authenticate } from "../shopify.server";
import { verifyShopifyWebhook } from "../utils/webhook-verification";

export const action = async ({ request }) => {
  // Get the raw body for HMAC verification
  const rawBody = await request.text();
  
  // Verify the webhook signature
  const isValid = verifyShopifyWebhook(
    request,
    rawBody,
    process.env.SHOPIFY_WEBHOOK_SECRET
  );

  if (!isValid) {
    console.error("Invalid webhook signature");
    return new Response("Invalid webhook signature", { status: 401 });
  }

  const { topic, shop, session } = await authenticate.webhook(request);

  if (!request.ok) {
    throw new Response("Webhook request failed", { status: 500 });
  }

  switch (topic) {
    case "customers/data_request":
      // Handle customer data request
      console.log("Customer data request received:", {
        shop,
        customerId: request.body.customer.id,
        timestamp: new Date().toISOString(),
      });
      // Add your data gathering logic here
      break;

    case "customers/redact":
      // Handle customer data erasure
      console.log("Customer data erasure request received:", {
        shop,
        customerId: request.body.customer.id,
        timestamp: new Date().toISOString(),
      });
      // Add your data deletion logic here
      break;

    case "shop/redact":
      // Handle shop data erasure
      console.log("Shop data erasure request received:", {
        shop,
        timestamp: new Date().toISOString(),
      });
      // Add your shop data deletion logic here
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return new Response(null, { status: 200 });
}; 