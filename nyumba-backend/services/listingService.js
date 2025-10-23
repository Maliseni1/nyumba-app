// nyumba-backend/services/listingService.js
const Listing = require('../models/listing');

async function create(data) {
    const listing = new Listing(data);
    return listing.save();
}

async function getAll(filters = {}) {
    const query = {};
    if (filters.title && filters.title.trim() !== '') {
        query.title = new RegExp(filters.title, 'i');
    }
    if (filters.beds && !isNaN(parseInt(filters.beds))) {
        query.bedrooms = { $gte: parseInt(filters.beds) };
    }
    if (filters.maxRent && !isNaN(parseInt(filters.maxRent))) {
        query.rent = { $lte: parseInt(filters.maxRent) };
    }
    return Listing.find(query).sort({ createdAt: -1 });
}

async function getById(id) {
    return Listing.findById(id).populate('landlord', 'name whatsappNumber');
}

async function getByLandlordId(landlordId) {
    return Listing.find({ landlord: landlordId }).sort({ createdAt: -1 });
}

async function updateById(id, data, userId) {
    const listing = await Listing.findById(id);
    if (!listing || listing.landlord.toString() !== userId) {
        throw new Error('Listing not found or user not authorized');
    }
    // We only update photoUrls if new ones are provided
    if (data.photoUrls && data.photoUrls.length > 0) {
        listing.photoUrls = data.photoUrls;
    }
    Object.assign(listing, data);
    return listing.save();
}

async function deleteById(id, userId) {
    const listing = await Listing.findOne({ _id: id, landlord: userId });
    if (!listing) {
        throw new Error('Listing not found or user not authorized');
    }
    return Listing.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    getByLandlordId,
    updateById,
    deleteById,
};