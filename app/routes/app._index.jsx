import { Page, Layout, Card, Text, BlockStack, Button, Link, Box, InlineStack } from "@shopify/polaris";
import { CurrencySelector } from "../components/CurrencySelector";
import { authenticate } from "../shopify.server";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect } from "react";



export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Get shop data from session
  const shop = session.shop.replace(".myshopify.com", "");
  
  return json({
    shop
  });
};

export default function Index() {
  useEffect(() => {
    const script1 = document.createElement("script");
    script1.innerHTML = "window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}";
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://salesiq.zohopublic.in/widget?wc=siq8db097391d7cb2f1c66fd31d72e60937f22ac00d3895c6e3f03078db00b002a6";



    script2.id = "zsiqscript";
    script2.defer = true;
    document.body.appendChild(script2);
  }, []);
  const { shop } = useLoaderData();
  const [copied, setCopied] = useState("");

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const htmlWithCurrency = '<span class="currency-changer">rs. {{ amount }}</span>';
  const htmlWithoutCurrency = '<span class="currency-changer">{{ amount }}</span>';

  const themeEditorUrl = `https://${shop}.myshopify.com/admin/themes/current/editor?context=apps&template=index&activateAppId=010de1f3-20a8-4c27-8078-9d5535ccae26/helloCurrency`;

  return (
    <Page>
      <BlockStack gap="500">
        <Text variant="headingXl" as="h1">Dashboard</Text>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
                <Text variant="headingLg" as="h2">
                  Step 1: Set up money format
                </Text>
                <Text as="p" variant="bodyMd">
                  This option allows you to set the money format of your store, which is essential for the app to function seamlessly.
                </Text>
                <Text as="p" variant="headingLg">
                  Steps to Follow
                </Text>
                <BlockStack gap="300">
                  <Text as="p">
                    Go to{" "}
                    <Link url="https://admin.shopify.com/store/teststorecvd/settings/general#currency-display" target="_blank">
                      Shopify Settings {'->'} General
                    </Link>
                  </Text>
                  <Text as="p">Under Store Currency section, select Change formatting</Text>
                  <Text as="p">Copy & Paste the below modified Money Formats to HTML with currency and HTML without currency section</Text>
                  <Text as="p">Click Save button on right top of the screen</Text>
                </BlockStack>

                <Box paddingBlockStart="400">
                  <BlockStack gap="400">
                    <Box>
                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">HTML with currency</Text>
                        <Box background="bg-surface-secondary" padding="300" borderRadius="200">
                          <InlineStack align="space-between">
                            <Text as="span" variant="bodyLg">{htmlWithCurrency}</Text>
                            <Button
                              onClick={() => handleCopy(htmlWithCurrency, "with")}
                              variant="plain"
                            >
                              {copied === "with" ? "Copied!" : "Copy"}
                            </Button>
                          </InlineStack>
                        </Box>
                        <Text as="p" variant="bodySm" tone="subdued">
  Note:  {"{{"}$amount {"}}"}USD is a placeholder. Replace it with your actual HTML without currency format from your store settings.
</Text>
                      </BlockStack>
                    </Box>

                    <Box>
                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">HTML without currency</Text>
                        <Box background="bg-surface-secondary" padding="300" borderRadius="200">
                          <InlineStack align="space-between">
                            <Text as="span" variant="bodyLg">{htmlWithoutCurrency}</Text>
                            <Button
                              onClick={() => handleCopy(htmlWithoutCurrency, "without")}
                              variant="plain"
                            >
                              {copied === "without" ? "Copied!" : "Copy"}
                            </Button>
                          </InlineStack>
                        </Box>
                       <Text as="p" variant="bodySm" tone="subdued">
  Note:  {"{{"}$amount {"}}"} is a placeholder. Replace it with your actual HTML without currency format from your store settings.
</Text>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
              
                <Text variant="headingLg" as="h2">
                  Step 2: Select Currency
                </Text>
                <CurrencySelector />
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
                <Text variant="headingLg" as="h2">
                  Step 3: Theme Editor Access
                </Text>
                <Text as="p" variant="bodyLg">
                  Click below to add currency selector to your website
                </Text>
                <Button
                  variant="primary"
                  url={themeEditorUrl}
                  target="_blank"
                  external
                >
                  Add Currency Selector
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
