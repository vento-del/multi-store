import { useState, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Text,
  Select,
  Tag,
  LegacyStack,
  Spinner,
  Icon,
  TextField,
  Banner,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";

export function CurrencySelector() {
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch currency data when component mounts
    fetch('https://openexchangerates.org/api/currencies.json')
      .then(response => response.json())
      .then(data => {
        const currencies = Object.entries(data).map(([code, name]) => ({
          value: code,
          label: `${code} - ${name}`
        }));
        setAvailableCurrencies(currencies);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching currencies:', error);
        setLoading(false);
      });

    // Fetch existing selected currencies from metafield
    fetch('/api/currencies')
      .then(response => response.json())
      .then(data => {
        if (data.currencies) {
          setSelectedCurrencies(data.currencies);
        }
      })
      .catch(error => {
        console.error('Error fetching saved currencies:', error);
      });
  }, []);

  const saveToMetafield = useCallback(async (currencies) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/currencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currencies }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save currencies');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleSelect = useCallback(
    (value) => {
      const selectedCurrency = availableCurrencies.find(
        (option) => option.value === value
      );
      if (selectedCurrency && !selectedCurrencies.some(c => c.value === value)) {
        const newSelectedCurrencies = [...selectedCurrencies, selectedCurrency];
        setSelectedCurrencies(newSelectedCurrencies);
        saveToMetafield(newSelectedCurrencies);
      }
      setSearchValue('');
    },
    [availableCurrencies, selectedCurrencies, saveToMetafield],
  );

  const removeTag = useCallback(
    (tag) => () => {
      const newSelectedCurrencies = selectedCurrencies.filter(
        (selected) => selected.value !== tag
      );
      setSelectedCurrencies(newSelectedCurrencies);
      saveToMetafield(newSelectedCurrencies);
    },
    [selectedCurrencies, saveToMetafield],
  );

  const handleClearAll = useCallback(() => {
    setSelectedCurrencies([]);
    saveToMetafield([]);
  }, [saveToMetafield]);

  const handleSearch = useCallback(
    (value) => {
      setSearchValue(value);
    },
    [],
  );

  const filteredOptions = availableCurrencies.filter(
    (option) => {
      if (searchValue === "") {
        return true;
      }
      return option.label.toLowerCase().includes(searchValue.toLowerCase());
    }
  );

  const tagsMarkup = selectedCurrencies.map((option) => (
    <Tag key={`option-${option.value}`} onRemove={removeTag(option.value)}>
      {option.label}
    </Tag>
  ));

  const clearButton = (
    <Button
      plain
      disabled={selectedCurrencies.length === 0 || saving}
      onClick={handleClearAll}
    >
      Clear all
    </Button>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        <Text variant="headingMd" as="h2">
          Select Currencies
        </Text>
        {error && (
          <div style={{ marginTop: "12px" }}>
            <Banner status="critical">
              {error}
            </Banner>
          </div>
        )}
        {success && (
          <div style={{ marginTop: "12px" }}>
            <Banner status="success">
              Currencies saved successfully
            </Banner>
          </div>
        )}
        <div style={{ marginTop: "12px" }}>
          <Select
            label="Search and select currencies"
            options={filteredOptions}
            onChange={handleSelect}
            value={searchValue}
            placeholder="Search currencies..."
            prefix={<Icon source={SearchIcon} color="base" />}
            onInputChange={handleSearch}
            autoComplete="off"
            disabled={saving}
          />
          <div style={{ marginTop: "8px" }}>
            <LegacyStack spacing="tight">
              {tagsMarkup}
              {clearButton}
            </LegacyStack>
          </div>
        </div>
      </div>
    </Card>
  );
} 