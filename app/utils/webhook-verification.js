import crypto from "crypto";

export function verifyShopifyWebhook(rawPayload, signature, webhookSecret) {
  try {
    // Convert raw payload to Buffer
    const rawBody = Buffer.from(rawPayload, 'utf8');
    
    // Calculate HMAC using raw body
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("base64");

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(generatedSignature)
    );
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return false;
  }
} 