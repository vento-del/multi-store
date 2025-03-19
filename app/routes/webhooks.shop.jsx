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
    case "shop/update":
      console.log("Shop updated:", {
        shop,
        name: request.body.name,
        email: request.body.email,
        currency: request.body.currency,
        timestamp: new Date().toISOString(),
      });
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return new Response(null, { status: 200 });
}; 