# Country Redirects Popup Extension

This extension displays a country selector popup on your Shopify store, allowing customers to choose their country from a dropdown and be redirected to the appropriate store.

## Features

- Displays a dropdown selector with all your configured country redirects
- Optionally includes Shopify Markets countries when enabled in settings
- Prevents duplicate countries (custom redirects take priority over Shopify Markets)
- Includes a "Shop Now" button that redirects to the selected country's URL
- Only shows active/enabled country redirects
- Customizable appearance
- Popup remembers user choices through cookies

## Setup Instructions

1. **Add the extension to your theme**:
   - In the theme editor, go to Add section/block
   - Find "Country Redirects Popup" under the available blocks
   - Add it to your theme

2. **Configure the popup**:
   - Set the popup title (default is "Select Your Country")
   - Customize colors for the popup background, text, title, close button, and "Shop Now" button

3. **Shopify Markets Integration**:
   - If you have `useShopifyMarkets: true` in your `shop.metafields.country-redirects.settings`, the popup will also include countries from Shopify Markets
   - Your custom country redirects will take priority over Shopify Markets redirects

## How It Works

The extension reads from two metafields:
1. `shop.metafields.country-redirects.countries` - Contains your custom country redirect configurations
2. `shop.metafields.country-redirects.settings` - Contains settings like whether to use Shopify Markets

When `useShopifyMarkets` is true, the extension also reads from Shopify's built-in localization system to get the list of available countries and their currencies.

The popup displays:
1. A dropdown menu with all your enabled countries in alphabetical order
2. A "Shop Now" button

### Duplicate Country Handling

If the same country appears in both your custom redirects and Shopify Markets:
- The country will only appear once in the dropdown
- The custom redirect will take priority over the Shopify Markets version
- When selected, the user will be redirected to your custom URL, not the Shopify Markets URL
- This ensures consistent behavior and prevents confusion

For example, if you have a custom redirect for "United States" to "example.com/us" and Shopify Markets also has "United States", the dropdown will show "United States" once, and clicking "Shop Now" will redirect to "example.com/us" rather than using Shopify Markets.

When a visitor selects a country and clicks the "Shop Now" button:
- For custom redirects: They will be redirected to the URL you've configured
- For Shopify Markets countries: The localization form will be submitted to change the country and currency

## Customization

You can customize the appearance of the popup through the block settings in the theme editor:
- Background color
- Text color
- Title color
- Close button color
- "Shop Now" button color

The popup will automatically appear to users when they visit your site. There are two ways it won't appear again:

1. If a user clicks the X button to close it, the popup won't appear again for 24 hours.
2. If a user selects a country and clicks "Shop Now", the popup won't appear again for 30 days.

This behavior is controlled by browser cookies and ensures that users aren't repeatedly shown the popup after they've made a selection.

## Cross-Store Redirects

This extension supports redirecting customers between different Shopify stores:

1. When a customer selects a country that redirects to a different store
2. The popup will not appear again when they arrive at the destination store
3. This works across different domains and subdomains

For example, if you have:
- Store A at `store-a.myshopify.com`
- Store B at `store-b.myshopify.com`

When a customer on Store A selects a country that redirects to Store B, they'll be sent to Store B and won't see the popup again.

This is achieved through:
- Cross-domain cookies (when possible)
- URL parameters for cross-domain communication
- LocalStorage as a fallback mechanism

## Troubleshooting

If you're having issues with the Shopify Markets integration:

1. Make sure your `shop.metafields.country-redirects.settings` metafield contains `"useShopifyMarkets": true` (with the quotes)
2. Check your browser console for debugging messages that will help identify any issues
3. Verify that your Shopify store has multiple countries available in the localization settings
4. If countries still don't appear, the extension includes fallback countries for testing purposes

For cross-store redirect issues:
1. Ensure your redirect URLs include the full domain (https://store-b.myshopify.com)
2. Check that cookies are not being blocked by browser privacy settings
3. The console logs will show if the cross-store detection is working

The extension includes extensive logging to help diagnose any issues with the integration.