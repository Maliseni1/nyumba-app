const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'openstreetmap',
    formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;