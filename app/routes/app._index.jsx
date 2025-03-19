import { Page, Layout } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { CurrencySelector } from "../components/CurrencySelector";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Dashboard() {
  return (
    <Page title="Currency Dashboard">
      <Layout>
        <Layout.Section>
          <CurrencySelector />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
