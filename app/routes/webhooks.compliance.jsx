import { authenticate } from "../shopify.server";
import { verifyShopifyWebhook } from "../utils/webhook-verification";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  try {
    // Clone the request before authentication to preserve the body
    const reqClone = request.clone();
    const rawPayload = await reqClone.text();

    // Get required headers
    const hmac = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic");
    const shop = request.headers.get("x-shopify-shop-domain");

    // Validate required headers
    if (!hmac || !topic || !shop) {
      console.error("Missing required Shopify webhook headers");
      return json({ message: "Missing required headers" }, 401);
    }
    
    // Verify webhook signature using raw payload
    const isValid = verifyShopifyWebhook(
      rawPayload,
      hmac,
      process.env.SHOPIFY_API_SECRET
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return json({ message: "Invalid signature" }, 401);
    }

    // Authenticate and get webhook data
    const { topic: verifiedTopic, shop: verifiedShop, session } = await authenticate.webhook(request);

    // Parse the payload for processing
    const webhookData = JSON.parse(rawPayload);

    // Log the webhook data for now
    console.log('Processing compliance webhook:', {
      topic: verifiedTopic,
      shop: verifiedShop,
      data: webhookData
    });

    // Handle specific compliance webhook topics
    switch (verifiedTopic) {
      case "customers/data_request":
        // Handle customer data request
        console.log("Customer data request received:", {
          shop: verifiedShop,
          customerId: webhookData.customer?.id,
          timestamp: new Date().toISOString(),
        });
        break;

      case "customers/redact":
        // Handle customer data erasure
        console.log("Customer data erasure request received:", {
          shop: verifiedShop,
          customerId: webhookData.customer?.id,
          timestamp: new Date().toISOString(),
        });
        break;

      case "shop/redact":
        // Handle shop data erasure
        console.log("Shop data erasure request received:", {
          shop: verifiedShop,
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        console.warn("Unhandled compliance webhook topic:", verifiedTopic);
    }

    // Respond quickly with 200 OK
    return json({ message: "Webhook processed successfully" }, 200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to acknowledge receipt
    return json({ message: "Webhook received with errors" }, 200);
  }
}; 