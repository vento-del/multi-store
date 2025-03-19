import crypto from "crypto";

// Shopify webhook verification utility
export function verifyShopifyWebhook(rawPayload, signature, webhookSecret) {
  try {
    if (!rawPayload || !signature || !webhookSecret) {
      console.error("Missing required parameters for webhook verification");
      return false;
    }

    // Calculate HMAC using raw payload
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
      .digest("base64");

    // Use timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(generatedSignature)
    );

    if (!isValid) {
      console.error("HMAC verification failed");
    }

    return isValid;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return false;
  }
} 