import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(
      `#graphql
        query {
          shop {
            id
            metafield(namespace: "currency-selector", key: "selected-currencies") {
              value
            }
          }
        }
      `
    );

    const responseJson = await response.json();
    const metafield = responseJson.data.shop.metafield;
    
    return json({
      currencies: metafield ? JSON.parse(metafield.value) : []
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return json({ currencies: [] });
  }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    // First get the shop ID
    const shopResponse = await admin.graphql(
      `#graphql
        query {
          shop {
            id
          }
        }
      `
    );
    const shopData = await shopResponse.json();
    const shopId = shopData.data.shop.id;

    const { currencies } = await request.json();

    const response = await admin.graphql(
      `#graphql
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          metafields: [
            {
              ownerId: shopId,
              namespace: "currency-selector",
              key: "selected-currencies",
              type: "json",
              value: JSON.stringify(currencies)
            }
          ]
        }
      }
    );

    const responseJson = await response.json();
    
    if (responseJson.data.metafieldsSet.userErrors.length > 0) {
      throw new Error(responseJson.data.metafieldsSet.userErrors[0].message);
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error saving currencies:', error);
    return json({ error: error.message }, { status: 500 });
  }
}; 