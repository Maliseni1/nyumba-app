const NodeGeocoder = require('node-geocoder');

// This configuration will read from your .env file
const options = {
    // 1. Read the provider name from your .env file
    provider: process.env.GEOCODER_PROVIDER || 'locationiq', 
    
    // 2. We no longer need userAgent or referer
    // We now use a professional API key
    apiKey: process.env.GEOCODER_API_KEY, 
    
    formatter: null 
};

// Check if the API key is present
if (!options.apiKey) {
    console.error("FATAL ERROR: GEOCODER_API_KEY is not set in your .env file!");
    console.error("Please sign up for a free key at locationiq.com and add it to .env");
    // We don't exit the process here, but geocoding will fail
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;