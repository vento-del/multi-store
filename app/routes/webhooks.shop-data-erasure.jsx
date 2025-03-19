import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  if (!request.ok) {
    throw new Response("Webhook request failed", { status: 500 });
  }

  switch (topic) {
    case "SHOP_DATA_ERASURE":
      // Handle shop data erasure
      // This is where you would delete all shop data

      // Log the request for compliance purposes
      console.log("Shop data erasure request received:", {
        shop,
        timestamp: new Date().toISOString(),
      });

      // Add your data deletion logic here
      // This should include deleting all data you have stored about the shop
      // Example:
      // await deleteShopSettings(shop);
      // await deleteShopPreferences(shop);
      // await deleteShopCustomers(shop);
      // etc.

      return new Response(null, { status: 200 });
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
}; 