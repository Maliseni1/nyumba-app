const NodeGeocoder = require('node-geocoder');

const options = {
  // --- THIS IS THE FIX ---
  // The provider key is 'openstreetmap', not 'nominatim'.
  provider: 'openstreetmap',
  // --- END OF FIX ---
  
  // These headers are still required to prevent future blocking
  userAgent: 'NyumbaApp/1.0 (mailto:admin@nyumba.app)', 
  referer: process.env.FRONTEND_URL || 'http://localhost:5173',

  formatter: null 
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;