import { useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Button,
  ButtonGroup,
  Modal,
  Form,
  FormLayout,
  TextField,
  Checkbox,
  Banner,
  EmptyState,
  LegacyStack,
  Select,
  Pagination,
  BlockStack,
  InlineStack,
  Box
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    // First get the shop ID and metafields
    const shopResponse = await admin.graphql(
      `#graphql
        query {
          shop {
            id
            countriesMetafield: metafield(namespace: "country-redirects", key: "countries") {
              value
            }
            settingsMetafield: metafield(namespace: "country-redirects", key: "settings") {
              value
            }
          }
        }
      `
    );
    
    const shopData = await shopResponse.json();
    const countriesMetafield = shopData.data.shop.countriesMetafield;
    const settingsMetafield = shopData.data.shop.settingsMetafield;
    
    // Parse settings or use default
    const settings = settingsMetafield 
      ? JSON.parse(settingsMetafield.value) 
      : { useShopifyMarkets: false };
    
    // Return the countries data or an empty array if no metafield exists
    return json({
      countries: countriesMetafield ? JSON.parse(countriesMetafield.value) : [],
      settings,
      shopId: shopData.data.shop.id
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return json({ 
      countries: [], 
      settings: { useShopifyMarkets: false },
      shopId: null, 
      error: error.message 
    });
  }
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

    if (action === "save") {
      const countriesData = JSON.parse(formData.get("countries"));
      
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
                key: "countries",
                type: "json",
                value: JSON.stringify(countriesData)
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
    console.error('Error saving data:', error);
    return json({ error: error.message }, { status: 500 });
  }
};

export default function CountriesPage() {
  const { countries: initialCountries, settings: initialSettings, error: loadError } = useLoaderData();
  const [countries, setCountries] = useState(initialCountries || []);
  const [settings, setSettings] = useState(initialSettings || { useShopifyMarkets: false });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const submit = useSubmit();

  // Country codes for dropdown
  const countryCodes = [
    { label: "Select a country", value: "" },
    { label: "United States", value: "US" },
    { label: "Canada", value: "CA" },
    { label: "United Kingdom", value: "GB" },
    { label: "Australia", value: "AU" },
    { label: "Germany", value: "DE" },
    { label: "France", value: "FR" },
    { label: "Italy", value: "IT" },
    { label: "Spain", value: "ES" },
    { label: "Japan", value: "JP" },
    { label: "China", value: "CN" },
    { label: "India", value: "IN" },
    { label: "Brazil", value: "BR" },
    { label: "Mexico", value: "MX" },
    { label: "Russia", value: "RU" },
    { label: "South Korea", value: "KR" },
    { label: "Netherlands", value: "NL" },
    { label: "Sweden", value: "SE" },
    { label: "Switzerland", value: "CH" },
    { label: "Singapore", value: "SG" },
    { label: "New Zealand", value: "NZ" },
    { label: "South Africa", value: "ZA" },
    { label: "United Arab Emirates", value: "AE" },
    { label: "Saudi Arabia", value: "SA" },
    { label: "Israel", value: "IL" },
    { label: "Turkey", value: "TR" },
    { label: "Thailand", value: "TH" },
    { label: "Indonesia", value: "ID" },
    { label: "Malaysia", value: "MY" },
    { label: "Philippines", value: "PH" },
    { label: "Vietnam", value: "VN" },
    { label: "Pakistan", value: "PK" },
    { label: "Bangladesh", value: "BD" },
    { label: "Nigeria", value: "NG" },
    { label: "Egypt", value: "EG" },
    { label: "Argentina", value: "AR" },
    { label: "Colombia", value: "CO" },
    { label: "Chile", value: "CL" },
    { label: "Peru", value: "PE" },
    { label: "Poland", value: "PL" },
    { label: "Ukraine", value: "UA" },
    { label: "Romania", value: "RO" },
    { label: "Czech Republic", value: "CZ" },
    { label: "Hungary", value: "HU" },
    { label: "Greece", value: "GR" },
    { label: "Portugal", value: "PT" },
    { label: "Austria", value: "AT" },
    { label: "Denmark", value: "DK" },
    { label: "Finland", value: "FI" },
    { label: "Norway", value: "NO" },
    { label: "Ireland", value: "IE" },
    { label: "Belgium", value: "BE" },
  ];

  const handleAddCountry = useCallback(() => {
    setCurrentCountry({
      id: Date.now().toString(),
      countryCode: "",
      countryName: "",
      redirectUrl: "",
      enabled: true
    });
    setIsModalOpen(true);
    setFormError("");
  }, []);

  const handleEditCountry = useCallback((country) => {
    setCurrentCountry({ ...country });
    setIsModalOpen(true);
    setFormError("");
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentCountry(null);
  }, []);

  const handleSaveCountry = useCallback(() => {
    // Get values directly from the currentCountry state
    const countryCode = currentCountry.countryCode;
    const redirectUrl = currentCountry.redirectUrl;
    const enabled = currentCountry.enabled;
    
    // Validation
    if (!countryCode) {
      setFormError("Country code is required");
      return;
    }
    
    if (!redirectUrl) {
      setFormError("Redirect URL is required");
      return;
    }
    
    // Find the country name from the code
    const countryOption = countryCodes.find(c => c.value === countryCode);
    const countryName = countryOption ? countryOption.label : countryCode;
    
    const updatedCountry = {
      id: currentCountry.id,
      countryCode,
      countryName,
      redirectUrl,
      enabled
    };
    
    let updatedCountries;
    if (countries.some(c => c.id === currentCountry.id)) {
      // Update existing country
      updatedCountries = countries.map(c => 
        c.id === currentCountry.id ? updatedCountry : c
      );
    } else {
      // Add new country
      updatedCountries = [...countries, updatedCountry];
    }
    
    setCountries(updatedCountries);
    
    // Save to metafield
    submit(
      { 
        action: "save", 
        countries: JSON.stringify(updatedCountries) 
      },
      { method: "post" }
    );
    
    setSuccessMessage("Country saved successfully");
    setTimeout(() => setSuccessMessage(""), 3000);
    
    handleCloseModal();
  }, [countries, currentCountry, submit, countryCodes]);

  const handleDeleteConfirm = useCallback(() => {
    if (!countryToDelete) return;
    
    const updatedCountries = countries.filter(c => c.id !== countryToDelete.id);
    setCountries(updatedCountries);
    
    // Save to metafield
    submit(
      { 
        action: "save", 
        countries: JSON.stringify(updatedCountries) 
      },
      { method: "post" }
    );
    
    setSuccessMessage("Country deleted successfully");
    setTimeout(() => setSuccessMessage(""), 3000);
    
    setIsDeleting(false);
    setCountryToDelete(null);
  }, [countries, countryToDelete, submit]);

  const handleToggleStatus = useCallback((country) => {
    const updatedCountries = countries.map(c => 
      c.id === country.id ? { ...c, enabled: !c.enabled } : c
    );
    
    setCountries(updatedCountries);
    
    // Save to metafield
    submit(
      { 
        action: "save", 
        countries: JSON.stringify(updatedCountries) 
      },
      { method: "post" }
    );
    
    setSuccessMessage(`Country ${country.enabled ? 'disabled' : 'enabled'} successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  }, [countries, submit]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCountries = countries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(countries.length / itemsPerPage);

  const resourceName = {
    singular: 'country',
    plural: 'countries',
  };

  const rowMarkup = currentCountries.map(
    (country, index) => (
      <IndexTable.Row
        id={country.id}
        key={country.id}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold">
            {country.countryName} ({country.countryCode})
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd">
            {country.redirectUrl}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd">
            <span style={{ 
              color: country.enabled ? 'var(--p-color-text-success)' : 'var(--p-color-text-critical)',
              fontWeight: 'bold'
            }}>
              {country.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <ButtonGroup>
            <Button onClick={() => handleEditCountry(country)}>
              Edit
            </Button>
            <Button 
              onClick={() => handleToggleStatus(country)}
              tone={country.enabled ? "critical" : "success"}
            >
              {country.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button 
              tone="critical" 
              onClick={() => {
                setCountryToDelete(country);
                setIsDeleting(true);
              }}
            >
              Delete
            </Button>
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const emptyState = (
    <EmptyState
      heading="Manage country redirects"
      action={{
        content: 'Add country',
        onAction: handleAddCountry,
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Add countries and their redirect URLs to enable country-based redirects.</p>
    </EmptyState>
  );

  return (
    <Page
      title="Country Redirects"
      primaryAction={{
        content: 'Add country',
        onAction: handleAddCountry,
      }}
    >
      {loadError && (
        <Banner status="critical">
          {loadError}
        </Banner>
      )}
      
      {successMessage && (
        <Banner status="success" onDismiss={() => setSuccessMessage("")}>
          {successMessage}
        </Banner>
      )}
      
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {countries.length === 0 ? (
              emptyState
            ) : (
              <>
                <IndexTable
                  resourceName={resourceName}
                  itemCount={currentCountries.length}
                  headings={[
                    { title: 'Country' },
                    { title: 'Redirect URL' },
                    { title: 'Status' },
                    { title: 'Actions' },
                  ]}
                  selectable={false}
                >
                  {rowMarkup}
                </IndexTable>
                
                {totalPages > 1 && (
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      hasPrevious={currentPage > 1}
                      onPrevious={() => setCurrentPage(currentPage - 1)}
                      hasNext={currentPage < totalPages}
                      onNext={() => setCurrentPage(currentPage + 1)}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
      
      {/* Add/Edit Country Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={currentCountry && currentCountry.countryName ? `Edit ${currentCountry.countryName}` : "Add Country"}
        primaryAction={{
          content: 'Save',
          onAction: handleSaveCountry,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleCloseModal,
          },
        ]}
      >
        <Modal.Section>
          {formError && (
            <Banner status="critical" onDismiss={() => setFormError("")}>
              {formError}
            </Banner>
          )}
          
          <div>
            <FormLayout>
              <Select
                label="Country"
                options={countryCodes}
                value={currentCountry?.countryCode || ""}
                onChange={(value) => {
                  setCurrentCountry({
                    ...currentCountry,
                    countryCode: value,
                    countryName: countryCodes.find(c => c.value === value)?.label || ""
                  });
                }}
                required
              />
              
              <TextField
                label="Redirect URL"
                value={currentCountry?.redirectUrl || ""}
                onChange={(value) => {
                  setCurrentCountry({
                    ...currentCountry,
                    redirectUrl: value
                  });
                }}
                placeholder="https://example.com"
                helpText="The URL to redirect users from this country to"
                required
              />
              
              <Checkbox
                label="Enabled"
                checked={currentCountry?.enabled || false}
                onChange={(checked) => {
                  setCurrentCountry({
                    ...currentCountry,
                    enabled: checked
                  });
                }}
              />
            </FormLayout>
          </div>
        </Modal.Section>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="Delete country"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: handleDeleteConfirm,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsDeleting(false),
          },
        ]}
      >
        <Modal.Section>
          <Text>
            Are you sure you want to delete {countryToDelete?.countryName}? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}