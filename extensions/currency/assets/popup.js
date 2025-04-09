// Popup script to display country redirects with a dropdown selector
document.addEventListener('DOMContentLoaded', function() {
  // Get the popup container
  const popupContainer = document.getElementById('metafield-popup-container');
  const popupContentContainer = document.getElementById('popup-content-container');
  const popupData = document.getElementById('metafield-popup-data');
  const popupSettings = document.getElementById('metafield-popup-settings');
  const localizationFormData = document.getElementById('localization-form-data');
  const closeButton = document.getElementById('metafield-popup-close');
  
  // Check URL parameters for vento flag
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('vento')) {
    console.log('Vento parameter found in URL, setting cookie');
    setCookie('country_popup_closed', 'true', 60);
    
    // Remove the parameter from URL to keep it clean (optional)
    if (window.history && window.history.replaceState) {
      // Create a new URL without the vento parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('vento');
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }
  
  // Check for cookie to determine if popup should be shown
  const popupCookie = getCookie('country_popup_closed');
  if (popupCookie) {
    console.log('Popup cookie found, not showing popup');
    return; // Exit early if cookie exists
  }
  
  // Check if we have data
  if (popupData) {
    try {
      // Parse the JSON data from the metafield
      const countryRedirects = JSON.parse(popupData.textContent.trim());
      
      // Parse settings if available
      let settings = { useShopifyMarkets: false };
      if (popupSettings && popupSettings.textContent.trim()) {
        try {
          const settingsText = popupSettings.textContent.trim();
          console.log('Settings text:', settingsText);
          
          // Check if the text contains the useShopifyMarkets:true string
          if (settingsText.includes('"useShopifyMarkets":true') || settingsText.includes('"useShopifyMarkets": true')) {
            settings.useShopifyMarkets = true;
          } else {
            // Try to parse as JSON if it's valid JSON
            try {
              const parsedSettings = JSON.parse(settingsText);
              settings = parsedSettings;
            } catch (jsonError) {
              console.log('Settings is not valid JSON, using string check instead');
            }
          }
        } catch (e) {
          console.error('Error processing settings:', e);
        }
      }
      
      console.log('Final settings object:', settings);
      
      // Check if we have valid data to display
      if (countryRedirects && countryRedirects.length > 0) {
        // Log the country redirects data for debugging
        console.log('Country redirects data:', countryRedirects);
        
        // Create a container for the country selector
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'country-selector-container';
        selectorContainer.style.textAlign = 'center';
        selectorContainer.style.marginTop = '20px';
        
        // Filter to only show enabled redirects
        const enabledRedirects = countryRedirects.filter(redirect => redirect.enabled);
        console.log('Enabled redirects:', enabledRedirects);
        
        // Get Shopify Markets countries if setting is enabled
        let shopifyCountries = [];
        console.log('Settings:', settings);
        console.log('Localization form data exists:', !!localizationFormData);
        
        if (settings.useShopifyMarkets === true) {
          console.log('Getting Shopify countries...');
          shopifyCountries = getShopifyCountries();
          console.log('Shopify countries:', shopifyCountries);
          
          // If we couldn't get any countries from the localization form,
          // add some fallback countries for testing
          if (shopifyCountries.length === 0) {
            console.log('No Shopify countries found, adding fallback countries');
            shopifyCountries = [
              { name: 'United States (USD $)', code: 'US', url: '#' },
              { name: 'Canada (CAD $)', code: 'CA', url: '#' },
              { name: 'United Kingdom (GBP £)', code: 'GB', url: '#' },
              { name: 'Australia (AUD $)', code: 'AU', url: '#' }
            ];
          }
        } else {
          console.log('Not using Shopify Markets');
        }
        
        if (enabledRedirects.length === 0 && shopifyCountries.length === 0) {
          const noRedirectsMsg = document.createElement('p');
          noRedirectsMsg.textContent = 'No country redirects are currently active.';
          noRedirectsMsg.style.textAlign = 'center';
          popupContentContainer.appendChild(noRedirectsMsg);
        } else {
          // Create the select element with enhanced styling for flags
          const countrySelect = document.createElement('select');
          countrySelect.id = 'country-select';
          countrySelect.className = 'country-select';
          
          // Add default option
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Select your country';
          defaultOption.selected = true;
          defaultOption.disabled = true;
          countrySelect.appendChild(defaultOption);
          
          // Create an array of all countries
          const allCountries = [];
          
          // Track country codes to avoid duplicates
          const countryCodesAdded = {};
          
          // Add custom redirect countries first (they take priority)
          enabledRedirects.forEach(redirect => {
            const countryCode = redirect.countryCode;
            
            // Mark this country code as added
            if (countryCode) {
              countryCodesAdded[countryCode.toUpperCase()] = true;
            }
            
            // Validate the redirect URL
            let redirectUrl = redirect.redirectUrl;
            if (redirectUrl) {
              // Ensure the URL has a protocol
              if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                console.log(`Adding protocol to URL for ${redirect.countryName || redirect.countryCode}: ${redirectUrl}`);
                redirectUrl = 'https://' + redirectUrl;
              }
              
              console.log(`Validated URL for ${redirect.countryName || redirect.countryCode}: ${redirectUrl}`);
            }
            
            allCountries.push({
              name: redirect.countryName || redirect.countryCode,
              value: redirectUrl,
              type: 'custom',
              code: countryCode
            });
          });
          
          // Add Shopify Markets countries, but skip any that already exist in custom redirects
          shopifyCountries.forEach(country => {
            // Skip if this country code was already added from custom redirects
            if (country.code && countryCodesAdded[country.code.toUpperCase()]) {
              console.log(`Skipping duplicate country: ${country.name} (${country.code})`);
              return;
            }
            
            allCountries.push({
              name: country.name,
              value: country.url,
              type: 'shopify',
              code: country.code
            });
            
            // Mark as added
            if (country.code) {
              countryCodesAdded[country.code.toUpperCase()] = true;
            }
          });
          
          // Sort all countries alphabetically by name
          allCountries.sort((a, b) => a.name.localeCompare(b.name));
          
          // Add all countries to the select element
          allCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.value;
            
            // Format the option text with a space for the flag
            option.textContent = country.name;
            
            option.dataset.type = country.type;
            if (country.code) {
              option.dataset.code = country.code;
              
              // Add a data attribute for the flag URL
              option.dataset.flag = `https://flagcdn.com/w20/${country.code.toLowerCase()}.png`;
            }
            
            // Store the country object in the option's dataset for reference
            option.dataset.countryInfo = JSON.stringify({
              name: country.name,
              value: country.value,
              type: country.type,
              code: country.code
            });
            
            countrySelect.appendChild(option);
          });
          
          selectorContainer.appendChild(countrySelect);
          
          // Create a custom dropdown wrapper for the select to show flags
          const selectWrapper = document.createElement('div');
          selectWrapper.className = 'select-wrapper';
          
          // Create a div to display the selected country with flag
          const selectedDisplay = document.createElement('div');
          selectedDisplay.className = 'selected-country';
          selectedDisplay.innerHTML = '<span class="globe-icon"></span><span>Select your country</span>';
          selectWrapper.appendChild(selectedDisplay);
          
          // Create a div to contain the dropdown options
          const dropdownOptions = document.createElement('div');
          dropdownOptions.className = 'dropdown-options';
          dropdownOptions.style.display = 'none';
          selectWrapper.appendChild(dropdownOptions);
          
          // Add options to the dropdown (limit to 15 visible at once)
          allCountries.forEach(country => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            optionDiv.dataset.value = country.value;
            optionDiv.dataset.type = country.type;
            
            let optionContent = '';
            if (country.code) {
              optionDiv.dataset.code = country.code;
              optionContent = `<img src="https://flagcdn.com/w20/${country.code.toLowerCase()}.png" alt="${country.code}" class="country-flag"> ${country.name}`;
            } else {
              optionContent = `<span class="no-flag"></span> ${country.name}`;
            }
            
            optionDiv.innerHTML = optionContent;
            
            // Store the country info
            optionDiv.dataset.countryInfo = JSON.stringify({
              name: country.name,
              value: country.value,
              type: country.type,
              code: country.code
            });
            
            // Add click event to select this option
            optionDiv.addEventListener('click', function() {
              // Update the selected display
              selectedDisplay.innerHTML = this.innerHTML;
              selectedDisplay.dataset.value = this.dataset.value;
              selectedDisplay.dataset.type = this.dataset.type;
              selectedDisplay.dataset.code = this.dataset.code;
              selectedDisplay.dataset.countryInfo = this.dataset.countryInfo;
              
              // Hide the dropdown
              dropdownOptions.style.display = 'none';
              
              // Update the actual select element
              for (let i = 0; i < countrySelect.options.length; i++) {
                if (countrySelect.options[i].value === this.dataset.value) {
                  countrySelect.selectedIndex = i;
                  break;
                }
              }
            });
            
            dropdownOptions.appendChild(optionDiv);
          });
          
          // Toggle dropdown on click
          selectedDisplay.addEventListener('click', function(e) {
            e.stopPropagation();
            if (dropdownOptions.style.display === 'none') {
              // Position the dropdown
              const rect = selectWrapper.getBoundingClientRect();
              const popupRect = popupContainer.getBoundingClientRect();
              
              // Check if dropdown would go below the viewport
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < 200 && rect.top > 200) {
                // Position above if there's more space
                dropdownOptions.style.bottom = rect.height + 'px';
                dropdownOptions.style.top = 'auto';
              } else {
                // Position below (default)
                dropdownOptions.style.top = '100%';
                dropdownOptions.style.bottom = 'auto';
              }
              
              dropdownOptions.style.display = 'block';
            } else {
              dropdownOptions.style.display = 'none';
            }
          });
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function() {
            dropdownOptions.style.display = 'none';
          });
          
          // Prevent clicks inside the dropdown from closing it
          dropdownOptions.addEventListener('click', function(e) {
            e.stopPropagation();
          });
          
          // Replace the select with our custom dropdown
          selectorContainer.appendChild(selectWrapper);
          
          // Hide the original select but keep it for form submission
          countrySelect.style.display = 'none';
          
          // Create Shop Now button
          const shopButton = document.createElement('button');
          shopButton.textContent = 'Shop Now';
          shopButton.className = 'shop-now-button';
          shopButton.style.marginTop = '15px';
          
          // Add click event to redirect
          shopButton.addEventListener('click', function() {
            // Get the selected country from our custom dropdown
            const selectedCountry = document.querySelector('.selected-country');
            
            // If no country is selected, use the original select as fallback
            let selectedValue, selectedType, selectedCode, countryInfo;
            
            if (selectedCountry && selectedCountry.dataset.value) {
              selectedValue = selectedCountry.dataset.value;
              selectedType = selectedCountry.dataset.type;
              selectedCode = selectedCountry.dataset.code;
              
              try {
                countryInfo = JSON.parse(selectedCountry.dataset.countryInfo);
              } catch (e) {
                console.error('Error parsing country info:', e);
              }
            } else {
              // Fallback to the original select
              const selectedOption = countrySelect.options[countrySelect.selectedIndex];
              if (!selectedOption || !selectedOption.value) {
                alert('Please select a country first');
                return;
              }
              
              selectedValue = selectedOption.value;
              selectedType = selectedOption.dataset.type;
              selectedCode = selectedOption.dataset.code;
              
              try {
                countryInfo = JSON.parse(selectedOption.dataset.countryInfo);
              } catch (e) {
                console.error('Error parsing country info:', e);
              }
            }
            
            if (selectedValue) {
              // Log the selected country for debugging
              console.log('Selected country:', {
                value: selectedValue,
                type: selectedType,
                code: selectedCode,
                info: countryInfo
              });
              
              // Hide the popup immediately
              popupContainer.style.display = 'none';
              
              // Set cookie to prevent popup from showing for 60 minutes
              setCookie('country_popup_closed', 'true', 60);
              console.log('Set popup cookie for 60 minutes');
              
              // Country info is already parsed above
              
              // Small delay before redirecting
              setTimeout(function() {
                // If we have parsed country info, use that to determine the redirect type
                if (countryInfo && countryInfo.type) {
                  console.log('Redirecting using country type:', countryInfo.type);
                  
                  if (countryInfo.type === 'shopify') {
                    // For Shopify Markets, we need to submit the localization form
                    const localizationForm = document.querySelector('form[action*="/localization"]');
                    if (localizationForm) {
                      const countryInput = localizationForm.querySelector('input[name="country_code"]');
                      if (countryInput && countryInfo.code) {
                        countryInput.value = countryInfo.code;
                        
                        // Submit the form
                        localizationForm.submit();
                        return;
                      }
                    }
                    // Fallback if form submission fails
                    alert('Unable to switch countries. Please try again.');
                  } else {
                    // For custom redirects
                    // Append a parameter to the URL to indicate the popup should be hidden
                    let redirectUrl = countryInfo.value;
                    console.log('Original redirect URL:', redirectUrl);
                    
                    try {
                      // Create a URL object to properly handle the URL
                      const url = new URL(redirectUrl);
                      
                      // Add the vento parameter
                      url.searchParams.set('vento', '1');
                      
                      // Get the final URL string
                      redirectUrl = url.toString();
                      console.log('Final redirect URL with vento parameter:', redirectUrl);
                      
                      // Perform the redirect
                      window.location.href = redirectUrl;
                    } catch (e) {
                      // If URL parsing fails (e.g., invalid URL), fall back to the original method
                      console.error('Error parsing URL, using fallback method:', e);
                      
                      // Check if the URL already has parameters
                      if (redirectUrl.includes('?')) {
                        redirectUrl += '&vento=1';
                      } else {
                        redirectUrl += '?vento=1';
                      }
                      
                      console.log('Final redirect URL with vento parameter (fallback method):', redirectUrl);
                      window.location.href = redirectUrl;
                    }
                  }
                } else {
                  // Fallback to the original logic if we couldn't parse the country info
                  console.log('Falling back to original redirect logic');
                  
                  if (selectedOption.dataset.type === 'shopify') {
                    // For Shopify Markets, we need to submit the localization form
                    const localizationForm = document.querySelector('form[action*="/localization"]');
                    if (localizationForm) {
                      const countryInput = localizationForm.querySelector('input[name="country_code"]');
                      if (countryInput) {
                        countryInput.value = selectedOption.dataset.code;
                        
                        // Submit the form
                        localizationForm.submit();
                        return;
                      }
                    }
                    // Fallback if form submission fails
                    alert('Unable to switch countries. Please try again.');
                  } else {
                    // For custom redirects
                    // Append a parameter to the URL to indicate the popup should be hidden
                    let redirectUrl = selectedOption.value;
                    console.log('Original redirect URL (fallback):', redirectUrl);
                    
                    try {
                      // Create a URL object to properly handle the URL
                      const url = new URL(redirectUrl);
                      
                      // Add the vento parameter
                      url.searchParams.set('vento', '1');
                      
                      // Get the final URL string
                      redirectUrl = url.toString();
                      console.log('Final redirect URL with vento parameter (fallback):', redirectUrl);
                      
                      // Perform the redirect
                      window.location.href = redirectUrl;
                    } catch (e) {
                      // If URL parsing fails (e.g., invalid URL), fall back to the original method
                      console.error('Error parsing URL, using fallback method:', e);
                      
                      // Check if the URL already has parameters
                      if (redirectUrl.includes('?')) {
                        redirectUrl += '&vento=1';
                      } else {
                        redirectUrl += '?vento=1';
                      }
                      
                      console.log('Final redirect URL with vento parameter (fallback method):', redirectUrl);
                      window.location.href = redirectUrl;
                    }
                  }
                }
              }, 200); // 200ms delay to ensure cookie is set
            } else {
              alert('Please select a country first');
            }
          });
          
          selectorContainer.appendChild(shopButton);
          popupContentContainer.appendChild(selectorContainer);
        }
        
        // Display the popup after a short delay with a smooth animation
        setTimeout(() => {
          popupContainer.style.opacity = '0';
          popupContainer.style.display = 'flex';
          
          // Trigger reflow to ensure the opacity transition works
          void popupContainer.offsetWidth;
          
          // Fade in
          popupContainer.style.opacity = '1';
          popupContainer.style.transition = 'opacity 0.4s ease-out';
        }, 1000);
        
        // Handle close button click
        closeButton.addEventListener('click', function() {
          popupContainer.style.display = 'none';
          // Set cookie to prevent popup from showing for 60 minutes
          setCookie('country_popup_closed', 'true', 60);
          console.log('Set popup cookie for 60 minutes');
        });
      } else {
        console.log('No country redirects configured');
      }
    } catch (error) {
      console.error('Error parsing country redirects data:', error);
    }
  }
});

// Helper function to get Shopify countries from the localization form data
function getShopifyCountries() {
  console.log('Getting Shopify countries from localization data');
  
  const localizationData = document.getElementById('localization-form-data');
  if (!localizationData) {
    console.log('Localization data element not found');
    return [];
  }
  
  console.log('Localization data HTML:', localizationData.innerHTML);
  
  const countryElements = localizationData.querySelectorAll('.country-data');
  console.log('Found country elements:', countryElements.length);
  
  if (!countryElements || countryElements.length === 0) {
    console.log('No country elements found in localization data');
    return [];
  }
  
  const countries = [];
  
  countryElements.forEach((element, index) => {
    console.log(`Country ${index} data:`, element.dataset);
    
    if (element.dataset.name && element.dataset.code) {
      const name = element.dataset.name;
      const code = element.dataset.code;
      const currencyCode = element.dataset.currencyCode || '';
      const currencySymbol = element.dataset.currencySymbol || '';
      
      let displayName = name;
      if (currencyCode && currencySymbol) {
        displayName += ` (${currencyCode} ${currencySymbol})`;
      }
      
      countries.push({
        name: displayName,
        code: code,
        url: '#' // We'll use the form submission instead of direct URL
      });
      
      console.log(`Added country: ${displayName}, code: ${code}`);
    } else {
      console.log('Skipping country element with missing data');
    }
  });
  
  console.log('Final Shopify countries list:', countries);
  return countries;
}

// Cookie utility functions
function setCookie(name, value, minutes) {
  let expires = '';
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  
  // Set the cookie with domain parameter to make it work across subdomains
  // This will set the cookie for the current domain and all subdomains
  const domain = getTopLevelDomain();
  document.cookie = name + '=' + (value || '') + expires + '; path=/; domain=' + domain + '; SameSite=None; Secure';
  
  // Also try to store in localStorage as a fallback for cross-domain scenarios
  try {
    localStorage.setItem(name, JSON.stringify({
      value: value,
      expires: minutes ? new Date().getTime() + (minutes * 60 * 1000) : null
    }));
  } catch (e) {
    console.log('LocalStorage not available:', e);
  }
}

function getCookie(name) {
  // First try to get from cookie
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  // If not found in cookie, try localStorage as fallback
  try {
    const storedItem = localStorage.getItem(name);
    if (storedItem) {
      const parsedItem = JSON.parse(storedItem);
      // Check if the stored item is expired
      if (!parsedItem.expires || parsedItem.expires > new Date().getTime()) {
        return parsedItem.value;
      } else {
        // Remove expired item
        localStorage.removeItem(name);
      }
    }
  } catch (e) {
    console.log('LocalStorage not available:', e);
  }
  
  return null;
}

// Helper function to get the top-level domain for cookie setting
function getTopLevelDomain() {
  const hostname = window.location.hostname;
  
  // Check if it's an IP address
  if (/^(\d+\.){3}\d+$/.test(hostname)) {
    return hostname;
  }
  
  // Check if it's localhost
  if (hostname === 'localhost') {
    return hostname;
  }
  
  // Extract the domain parts
  const parts = hostname.split('.');
  
  // If we have a simple domain like example.com
  if (parts.length <= 2) {
    return hostname;
  }
  
  // For subdomains, we want to set the cookie on the top-level domain
  // This will be something like .example.com
  return '.' + parts.slice(-2).join('.');
}