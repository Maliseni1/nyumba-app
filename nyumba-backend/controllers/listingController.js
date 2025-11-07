const asyncHandler = require('express-async-handler');
const Listing = require('../models/listingModel');
const User = require('../models/userModel');
const geocoder = require('../utils/geocoder');

const getListings = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query;
    const isPremiumTenant = req.user?.isPremiumTenant || false;

    let filter = {
        owner: { $ne: null },
    };

    if (searchTerm) {
        filter.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { 'location.address': { $regex: searchTerm, $options: 'i' } }
        ];
    }

    // --- THIS IS THE FIX ---
    // Show listings that are public OR were created before this feature
    if (!isPremiumTenant) {
        filter.$or = [
            ...(filter.$or || []), // Keep existing $or search terms if they exist
            { publicReleaseAt: { $lte: new Date() } },
            { publicReleaseAt: { $exists: false } } // This line fixes your old listings
        ];
    }
    // --- END OF FIX ---
    
    const listings = await Listing.find(filter)
        .populate('owner', 'name profilePicture')
        .sort({ isPriority: -1, createdAt: -1 }); 
        
    res.json(listings);
});

const getListingsNearby = asyncHandler(async (req, res) => {
    // ... (unchanged)
    const { lat, lng } = req.query;
    if (!lat || !lng) { /* ... */ }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const isPremiumTenant = req.user?.isPremiumTenant || false;
    let dateFilter = {};
    if (!isPremiumTenant) {
        // --- ADDED THE SAME FIX HERE ---
        dateFilter['$match'] = {
            $or: [
                { publicReleaseAt: { $lte: new Date() } },
                { publicReleaseAt: { $exists: false } }
            ]
        };
    } else {
        dateFilter['$match'] = {}; 
    }

    const listings = await Listing.aggregate([
        { $geoNear: { /* ... */ } },
        dateFilter, 
        { $sort: { isPriority: -1, distance: 1 } },
        { $lookup: { /* ... */ } },
        { $unwind: { /* ... */ } },
        { $project: { /* ... */ } },
    ]);
    res.json(listings);
});

const reverseGeocode = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { lat, lng } = req.query;
    if (!lat || !lng) { /* ... */ }
    try {
        const geoData = await geocoder.reverse({ lat: parseFloat(lat), lon: parseFloat(lng) });
        if (!geoData.length) { /* ... */ }
        res.json({ address: geoData[0].formattedAddress });
    } catch (error) { /* ... */ }
});

const getListingById = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const listing = await Listing.findById(req.params.id)
        .populate('owner', '_id name profilePicture');
    if (!listing) { /* ... */ }

    const isPremiumTenant = req.user?.isPremiumTenant || false;
    // --- ADDED THE SAME FIX HERE ---
    // If the field doesn't exist, it's not an early access listing.
    const isEarlyAccess = listing.publicReleaseAt && new Date(listing.publicReleaseAt) > new Date();

    if (isEarlyAccess && !isPremiumTenant) {
        res.status(403);
        throw new Error('This is an early-access listing. Subscribe to Nyumba Premium to view it now.');
    }

    listing.analytics.views = (listing.analytics.views || 0) + 1;
    await listing.save();
    
    res.json(listing);
});

const createListing = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    if (req.user.role !== 'landlord') { /* ... */ }
    const { title, description, price, location, bedrooms, bathrooms, propertyType } = req.body;
    let geoData;
    try {
        geoData = await geocoder.geocode(location);
        if (!geoData.length) { /* ... */ }
    } catch (error) { /* ... */ }
    const { longitude, latitude, formattedAddress } = geoData[0];
    const locationData = { /* ... */ };
    const images = req.files ? req.files.map(file => file.path) : [];
    const publicReleaseDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newListing = new Listing({
        title, description, price, location: locationData, bedrooms, bathrooms, propertyType, images,
        owner: req.user._id,
        publicReleaseAt: publicReleaseDate 
    });

    const createdListing = await newListing.save();
    const user = await User.findById(req.user._id);
    user.listings.push(createdListing._id);
    await user.save();
    res.status(201).json(createdListing);
});

const updateListing = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { title, description, price, location, bedrooms, bathrooms, propertyType, existingImages } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.owner.toString() !== req.user._id.toString()) { /* ... */ }
    if (location && location !== listing.location.address) { /* ... */ }
    let newImages = req.files ? req.files.map(file => file.path) : [];
    const updatedImages = existingImages ? (Array.isArray(existingImages) ? [...existingImages, ...newImages] : [existingImages, ...newImages]) : newImages;
    listing.title = title;
    listing.description = description;
    listing.price = price;
    listing.bedrooms = bedrooms;
    listing.bathrooms = bathrooms;
    listing.propertyType = propertyType;
    listing.images = updatedImages;
    const updatedListing = await listing.save();
    res.json(updatedListing);
});

const deleteListing = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.owner.toString() !== req.user._id.toString()) { /* ... */ }
    const user = await User.findById(req.user._id);
    user.listings.pull(listing._id);
    await user.save();
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
});

const setListingStatus = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.owner.toString() !== req.user._id.toString()) { /* ... */ }
    if (status !== 'available' && status !== 'occupied') { /* ... */ }
    listing.status = status;
    const updatedListing = await listing.save();
    res.json(updatedListing);
});

const getRecommendedListings = asyncHandler(async (req, res) => {
    // ... (function is unchanged)
    const user = await User.findById(req.user._id).populate('savedListings');
    const savedListingIds = user.savedListings.map(l => l._id);
    const ownedListingIds = user.listings.map(l => l._id);
    const excludeIds = [...savedListingIds, ...ownedListingIds];
    let recommendations = [];
    if (user.savedListings.length > 0) {
        // ... (recommendation logic)
        const query = {
            status: 'available',
            _id: { $nin: excludeIds },
            // --- ADDED THE SAME FIX HERE ---
            $or: [
                { publicReleaseAt: { $lte: new Date() } },
                { publicReleaseAt: { $exists: false } }
            ],
            $or: [ /* ... */ ]
        };
        recommendations = await Listing.find(query).limit(6).populate('owner', 'name profilePicture');
    }
    if (recommendations.length === 0) {
        recommendations = await Listing.find({ 
            status: 'available',
            _id: { $nin: excludeIds },
            // --- ADDED THE SAME FIX HERE ---
            $or: [
                { publicReleaseAt: { $lte: new Date() } },
                { publicReleaseAt: { $exists: false } }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('owner', 'name profilePicture');
    }
    res.json(recommendations);
});

module.exports = {
    getListings,
    getListingsNearby,
    reverseGeocode,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
    setListingStatus,
    getRecommendedListings,
};