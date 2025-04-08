import { Page, Layout, Card, Text, BlockStack, Button, Box, InlineStack, Checkbox, Banner } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useCallback } from "react";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";


export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  // Fetch settings
  const response = await admin.graphql(
    `#graphql
      query {
        shop {
          settingsMetafield: metafield(namespace: "country-redirects", key: "settings") {
            value
          }
        }
      }
    `
  );

  const responseJson = await response.json();
  const settingsMetafield = responseJson.data.shop.settingsMetafield;
  
  // Parse settings or use default
  const settings = settingsMetafield 
    ? JSON.parse(settingsMetafield.value) 
    : { useShopifyMarkets: false };
  
  return json({
    settings
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  
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

    if (action === "saveSettings") {
      const settings = JSON.parse(formData.get("settings"));
      
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
                namespace: "country-redirects",
                key: "settings",
                type: "json",
                value: JSON.stringify(settings)
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
    }
    
    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error('Error saving settings:', error);
    return json({ error: error.message }, { status: 500 });
  }
};

export default function Index() {
  const { settings: initialSettings } = useLoaderData();
  const [settings, setSettings] = useState(initialSettings || { useShopifyMarkets: false });
  const [successMessage, setSuccessMessage] = useState("");
  const submit = useSubmit();
  
  const handleMarketToggle = useCallback((checked) => {
    const updatedSettings = { ...settings, useShopifyMarkets: checked };
    setSettings(updatedSettings);
    
    // Save to metafield
    submit(
      { 
        action: "saveSettings", 
        settings: JSON.stringify(updatedSettings) 
      },
      { method: "post" }
    );
    
    setSuccessMessage(`Shopify Markets integration ${checked ? 'enabled' : 'disabled'} successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  }, [settings, submit]);

  return (
    <Page title="Dashboard">
      <BlockStack gap="500">
        {successMessage && (
          <Banner status="success" onDismiss={() => setSuccessMessage("")}>
            {successMessage}
          </Banner>
        )}
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
                <Text variant="headingLg" as="h2">
                  Market Integration
                </Text>
                <InlineStack align="space-between">
                  <BlockStack gap="200">
                    <Text variant="bodyLg" as="p">
                      Enable this option to integrate with Shopify Markets for country detection. 
                      When enabled, countries listed in your custom redirects will override Market redirects, 
                      while all other countries will use Shopify Markets redirection.
                    </Text>
                  </BlockStack>
                  <Box paddingInlineStart="400">
                    <Checkbox
                      label="Use Shopify Markets"
                      checked={settings.useShopifyMarkets}
                      onChange={handleMarketToggle}
                    />
                  </Box>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
                <Text variant="headingLg" as="h2">
                  Country Redirects
                </Text>
                <Text as="p" variant="bodyLg">
                  Set up country-specific redirects to send visitors to the appropriate store or website based on their location.
                  {settings.useShopifyMarkets && " These redirects will override Shopify Markets for the countries you specify."}
                </Text>
                <Button
                  variant="primary"
                  url="/app/countries"
                >
                  Manage Country Redirects
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
