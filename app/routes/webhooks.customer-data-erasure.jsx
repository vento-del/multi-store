import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  if (!request.ok) {
    throw new Response("Webhook request failed", { status: 500 });
  }

  switch (topic) {
    case "CUSTOMERS_DATA_ERASURE":
      // Handle customer data erasure
      // This is where you would delete all customer data
      const customerId = request.body.customer.id;

      // Log the request for compliance purposes
      console.log("Customer data erasure request received:", {
        shop,
        customerId,
        timestamp: new Date().toISOString(),
      });

      // Add your data deletion logic here
      // This should include deleting all data you have stored about the customer
      // Example:
      // await deleteCustomerData(customerId);
      // await deleteCustomerPreferences(customerId);
      // etc.

      return new Response(null, { status: 200 });
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
}; 