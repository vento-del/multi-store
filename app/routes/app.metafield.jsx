import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
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
              id
              namespace
              key
              value
              type
            }
          }
        }
      `
    );

    const responseJson = await response.json();
    const metafield = responseJson.data.shop.metafield;
    
    return {
      metafield: metafield ? {
        ...metafield,
        value: JSON.parse(metafield.value)
      } : null
    };
  } catch (error) {
    console.error('Error fetching metafield:', error);
    return { metafield: null };
  }
};

export default function MetafieldView() {
  const { metafield } = useLoaderData();

  return (
    <Page title="Currency Metafield Data">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400" padding="400">
              <Text variant="headingMd" as="h2">
                Metafield Information
              </Text>
              {metafield ? (
                <>
                  <BlockStack gap="200">
                    <Text as="p">
                      <strong>Namespace:</strong> {metafield.namespace}
                    </Text>
                    <Text as="p">
                      <strong>Key:</strong> {metafield.key}
                    </Text>
                    <Text as="p">
                      <strong>Type:</strong> {metafield.type}
                    </Text>
                    <Text as="p">
                      <strong>Selected Currencies:</strong>
                    </Text>
                    <ul>
                      {metafield.value.map((currency, index) => (
                        <li key={index}>
                          {currency.label} ({currency.value})
                        </li>
                      ))}
                    </ul>
                  </BlockStack>
                  <Text as="p">
                    <strong>Metafield ID:</strong> {metafield.id}
                  </Text>
                </>
              ) : (
                <Text as="p">No metafield data found.</Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 