const NodeGeocoder = require('node-geocoder');

const options = {
  // This must be 'openstreetmap', not 'nominatim'
  provider: 'openstreetmap', 
  
  // --- THIS IS THE FIX ---
  // Nominatim's policy requires a custom User-Agent to identify your app.
  // We will use your app's name.
  userAgent: 'NyumbaApp/1.0 (mailto:maliseni1205@gmail.com)', 
  
  // It's also good practice to set a Referer header
  // This should be your *production* frontend URL
  referer: process.env.FRONTEND_URL || 'https://nyumba-app.vercel.app',
  // --- END OF FIX ---

  formatter: null 
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;