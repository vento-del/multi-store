import { Page, Layout, Card, TextContainer, Text } from "@shopify/polaris";

export default function PrivacyPolicy() {
  return (
    <Page title="Privacy Policy">
      <Layout>
        <Layout.Section>
          <Card>
            <TextContainer>
              <Text variant="headingMd">Privacy Policy</Text>
              <Text>Last updated: March 2025</Text>
              
              <Text variant="headingSm">1. Introduction</Text>
              <Text>
                This Privacy Policy explains how [Your App Name] collects, uses, and protects
                your information when you use our Shopify app.
              </Text>
              
              <Text variant="headingSm">2. Information We Collect</Text>
              <Text>We may collect the following information when you install our app:</Text>
              <ul>
                <li>Shopify store details (store name, domain, email)</li>
                <li>Order and product data (if required by app functionality)</li>
                <li>Any additional data necessary for the app's features</li>
              </ul>
              
              <Text variant="headingSm">3. How We Use Your Information</Text>
              <Text>We use the collected data to:</Text>
              <ul>
                <li>Provide and improve our app's functionality</li>
                <li>Offer customer support</li>
                <li>Ensure compliance with Shopify policies</li>
              </ul>
              
              <Text variant="headingSm">4. Data Sharing and Security</Text>
              <Text>
                We do not sell or share your data with third parties. All information is securely
                stored and protected following industry standards.
              </Text>
              
              <Text variant="headingSm">5. Contact Us</Text>
              <Text>
                If you have any questions about this Privacy Policy, you can contact us at
                <strong> ventosupprt@gmail.com</strong>.
              </Text>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}