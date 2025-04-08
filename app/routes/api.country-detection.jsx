import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Get the client IP address
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("cf-connecting-ip") || 
               request.socket.remoteAddress;
    
    // Call a geolocation API to get country information
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    return json({
      ip,
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region
    });
  } catch (error) {
    console.error('Error detecting country:', error);
    return json({ error: error.message }, { status: 500 });
  }
};