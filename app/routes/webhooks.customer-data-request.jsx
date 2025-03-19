import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  if (!request.ok) {
    throw new Response("Webhook request failed", { status: 500 });
  }

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // Handle customer data request
      // This is where you would gather all customer data and prepare it for export
      const customerData = {
        // Add your customer data gathering logic here
        // This should include all data you have stored about the customer
        message: "Customer data request received",
        timestamp: new Date().toISOString(),
      };

      // Log the request for compliance purposes
      console.log("Customer data request received:", {
        shop,
        customerId: request.body.customer.id,
        timestamp: new Date().toISOString(),
      });

      return new Response(null, { status: 200 });
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
}; 