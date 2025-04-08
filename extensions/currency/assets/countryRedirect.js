// Country Redirect Script
(function() {
  // Get the country redirects data from the metafield
  const countryRedirectsElement = document.getElementById('country-redirects-data');
  if (!countryRedirectsElement) {
    console.log('Country redirects data element not found');
    return;
  }

  try {
    // Parse the JSON from the element
    const countryRedirects = JSON.parse(countryRedirectsElement.textContent);
    
    // Check if there are any redirects configured
    if (!countryRedirects || countryRedirects.length === 0) {
      console.log('No country redirects configured');
      return;
    }

    // Check if user has already been redirected (to prevent redirect loops)
    const hasBeenRedirected = sessionStorage.getItem('countryRedirected');
    if (hasBeenRedirected) {
      console.log('User has already been redirected');
      return;
    }

    // Function to get user's country code
    function getUserCountry() {
      return new Promise((resolve, reject) => {
        fetch('https://ipapi.co/json/')
          .then(response => response.json())
          .then(data => {
            if (data && data.country_code) {
              resolve(data.country_code);
            } else {
              reject('Could not determine country');
            }
          })
          .catch(error => {
            console.error('Error fetching country:', error);
            reject(error);
          });
      });
    }

    // Check if the current URL matches any of the redirect URLs
    // This prevents redirect loops
    function isRedirectUrl(url) {
      const currentUrl = window.location.href;
      // Remove protocol and trailing slash for comparison
      const normalizedCurrentUrl = currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const normalizedUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      return normalizedCurrentUrl.includes(normalizedUrl);
    }

    // Main function to check country and redirect if needed
    async function checkCountryAndRedirect() {
      try {
        const userCountry = await getUserCountry();
        console.log('User country:', userCountry);
        
        // Find matching redirect
        const matchingRedirect = countryRedirects.find(redirect => 
          redirect.countryCode === userCountry && redirect.enabled
        );
        
        if (matchingRedirect) {
          console.log('Found matching redirect:', matchingRedirect);
          
          // Check if we're already on the redirect URL to prevent loops
          if (!isRedirectUrl(matchingRedirect.redirectUrl)) {
            // Set flag in session storage to prevent redirect loops
            sessionStorage.setItem('countryRedirected', 'true');
            
            // Redirect the user
            console.log('Redirecting to:', matchingRedirect.redirectUrl);
            window.location.href = matchingRedirect.redirectUrl;
          } else {
            console.log('Already on redirect URL, not redirecting');
          }
        } else {
          console.log('No matching redirect found for country:', userCountry);
        }
      } catch (error) {
        console.error('Error in country redirect:', error);
      }
    }

    // Execute the redirect check
    checkCountryAndRedirect();
    
  } catch (error) {
    console.error('Error parsing country redirects data:', error);
  }
})();