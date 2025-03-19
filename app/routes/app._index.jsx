import { Page, Layout, Card, Text, BlockStack, Button, Link, Box, InlineStack, ButtonGroup } from "@shopify/polaris";
import { CurrencySelector } from "../components/CurrencySelector";
import { authenticate } from "../shopify.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const [copied, setCopied] = useState("");

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const htmlWithCurrency = "<span class='currency-changer'>rs. {{ amount }}</span>";
  const htmlWithoutCurrency = "<span class='currency-changer'>rs. {{ amount }}</span>";

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
                <Text variant="headingMd" as="h2">
                  Step 1: Set up money format
                </Text>
                <Text as="p" variant="bodyMd">
                  This option allows you to set the money format of your store, which is essential for the app to function seamlessly.
                </Text>
                <Text as="p" variant="headingMd">
                  Steps to Follow
                </Text>
                <BlockStack gap="300">
                  <Text as="p">
                    Go to{" "}
                    <Link url="https://admin.shopify.com/store/teststorecvd/settings/general#currency-display" target="_blank">
                      Shopify Settings -> General
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
                            <Text as="span" variant="bodyMd">{htmlWithCurrency}</Text>
                            <Button
                              onClick={() => handleCopy(htmlWithCurrency, "with")}
                              variant="plain"
                            >
                              {copied === "with" ? "Copied!" : "Copy"}
                            </Button>
                          </InlineStack>
                        </Box>
                      </BlockStack>
                    </Box>

                    <Box>
                      <BlockStack gap="200">
                        <Text variant="headingMd" as="h3">HTML without currency</Text>
                        <Box background="bg-surface-secondary" padding="300" borderRadius="200">
                          <InlineStack align="space-between">
                            <Text as="span" variant="bodyMd">{htmlWithoutCurrency}</Text>
                            <Button
                              onClick={() => handleCopy(htmlWithoutCurrency, "without")}
                              variant="plain"
                            >
                              {copied === "without" ? "Copied!" : "Copy"}
                            </Button>
                          </InlineStack>
                        </Box>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
                <Text variant="headingMd" as="h2">
                  Select Currency
                </Text>
                <CurrencySelector />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400" padding="400">
                <Text variant="headingMd" as="h2">
                  Box 2
                </Text>
                <Text as="p">
                  Content for Box 2 will be added here
                </Text>
                <Button>Click me</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
