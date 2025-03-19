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
    case "orders/create":
      console.log("Order created:", {
        shop,
        orderId: request.body.id,
        orderNumber: request.body.order_number,
        totalPrice: request.body.total_price,
        timestamp: new Date().toISOString(),
      });
      break;

    case "orders/updated":
      console.log("Order updated:", {
        shop,
        orderId: request.body.id,
        orderNumber: request.body.order_number,
        totalPrice: request.body.total_price,
        timestamp: new Date().toISOString(),
      });
      break;

    case "orders/cancelled":
      console.log("Order cancelled:", {
        shop,
        orderId: request.body.id,
        orderNumber: request.body.order_number,
        timestamp: new Date().toISOString(),
      });
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return new Response(null, { status: 200 });
}; 