const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'nominatim',
  
  // --- THIS IS THE FIX ---
  // Nominatim's policy requires a custom User-Agent to identify your app.
  // We will use your app's name.
  // You can replace 'admin@nyumba.app' with your real contact email.
  
  userAgent: 'NyumbaApp/1.0 (mailto:admin@nyumba.app)', 
  
  // It's also good practice to set a Referer header
  // Replace this with your actual production frontend URL when you deploy
  referer: process.env.FRONTEND_URL || 'http://localhost:5173',

  // This is often needed for Nominatim to format the response correctly
  formatter: null 
  // --- END OF FIX ---
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;