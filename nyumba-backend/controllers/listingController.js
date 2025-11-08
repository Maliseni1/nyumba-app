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
        // If $or already exists (from search), add to it. Otherwise, create it.
        if (filter.$or) {
            filter.$and = [
                { $or: filter.$or }, // Keep the search terms
                { $or: [ // Add the date requirement
                    { publicReleaseAt: { $lte: new Date() } },
                    { publicReleaseAt: { $exists: false } }
                ]}
            ];
            delete filter.$or; // Remove the original $or to avoid conflict
        } else {
            // If no search term, just add the date filter
            filter.$or = [
                { publicReleaseAt: { $lte: new Date() } },
                { publicReleaseAt: { $exists: false } } // This line fixes your old listings
            ];
        }
    }
    // --- END OF FIX ---
    
    const listings = await Listing.find(filter)
        .populate('owner', 'name profilePicture')
        .sort({ isPriority: -1, createdAt: -1 }); 
        
    res.json(listings);
});

const getListingsNearby = asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        res.status(400);
        throw new Error('Please provide latitude and longitude');
    }
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
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [longitude, latitude] },
                distanceField: 'distance',
                maxDistance: 100000,
                spherical: true,
            },
        },
        dateFilter, 
        { $sort: { isPriority: -1, distance: 1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerDetails',
            },
        },
        { $unwind: { path: '$ownerDetails', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                title: 1, price: 1, location: 1, bedrooms: 1, bathrooms: 1, propertyType: 1, images: 1, createdAt: 1, distance: 1,
                isPriority: 1, publicReleaseAt: 1,
                owner: {
                    _id: '$ownerDetails._id',
                    name: '$ownerDetails.name',
                    profilePicture: '$ownerDetails.profilePicture',
                },
            },
        },
    ]);
    res.json(listings);
});

const reverseGeocode = asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        res.status(400);
        throw new Error('Please provide latitude and longitude');
    }
    try {
        const geoData = await geocoder.reverse({ lat: parseFloat(lat), lon: parseFloat(lng) });
        if (!geoData.length) {
            res.status(404);
            throw new Error('Could not find an address for this location.');
        }
        res.json({ address: geoData[0].formattedAddress });
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Reverse geocoding failed');
    }
});

const getListingById = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate('owner', '_id name profilePicture');

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    const isPremiumTenant = req.user?.isPremiumTenant || false;
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
    if (req.user.role !== 'landlord') {
        res.status(403);
        throw new Error('Only landlords can create listings.');
    }
    const { title, description, price, location, bedrooms, bathrooms, propertyType } = req.body;
    let geoData;
    try {
        geoData = await geocoder.geocode(location);
        if (!geoData.length) {
            res.status(400);
            throw new Error('Address not found. Please provide a valid location.');
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message || 'Geocoding failed');
    }
    const { longitude, latitude, formattedAddress } = geoData[0];
    const locationData = {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: formattedAddress || location,
    };
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
    const { title, description, price, location, bedrooms, bathrooms, propertyType, existingImages } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }
    if (location && location !== listing.location.address) {
        let geoData;
        try {
            geoData = await geocoder.geocode(location);
            if (!geoData.length) {
                res.status(400);
                throw new Error('Address not found. Please provide a valid location.');
            }
        } catch (error) {
            res.status(400);
            throw new Error(error.message || 'Geocoding failed');
        }
        const { longitude, latitude, formattedAddress } = geoData[0];
        listing.location = {
            type: 'Point',
            coordinates: [longitude, latitude],
            address: formattedAddress || location,
        };
    }
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
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.owner.toString() !== req.user._id.toString()) {
        res.status(401); 
        throw new Error('Not authorized');
    }
    const user = await User.findById(req.user._id);
    user.listings.pull(listing._id);
    await user.save();
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
});

const setListingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing || listing.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }
    if (status !== 'available' && status !== 'occupied') {
        res.status(400);
        throw new Error("Invalid status. Must be 'available' or 'occupied'.");
    }

    listing.status = status;
    const updatedListing = await listing.save();
    res.json(updatedListing);
});

const getRecommendedListings = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('savedListings');
    
    const savedListingIds = user.savedListings.map(l => l._id);
    const ownedListingIds = user.listings.map(l => l._id);
    const excludeIds = [...savedListingIds, ...ownedListingIds];

    let recommendations = [];

    // Base query for all recommendations
    const baseQuery = {
        status: 'available',
        _id: { $nin: excludeIds },
        $or: [
            { publicReleaseAt: { $lte: new Date() } },
            { publicReleaseAt: { $exists: false } }
        ]
    };

    if (user.savedListings.length > 0) {
        // --- Smart Recommendations ---
        
        const totalPrice = user.savedListings.reduce((acc, l) => acc + l.price, 0);
        const avgPrice = totalPrice / user.savedListings.length;
        const minPrice = avgPrice * 0.75; // 25% below avg
        const maxPrice = avgPrice * 1.25; // 25% above avg

        const typeCounts = user.savedListings.reduce((acc, l) => {
            acc[l.propertyType] = (acc[l.propertyType] || 0) + 1;
            return acc;
        }, {});
        const mostCommonType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b, null);

        // Build the smart query on top of the base query
        const smartQuery = {
            ...baseQuery,
            $or: [
                { propertyType: mostCommonType },
                { price: { $gte: minPrice, $lte: maxPrice } }
            ]
        };

        recommendations = await Listing.find(smartQuery)
            .limit(6)
            .populate('owner', 'name profilePicture');
    }

    // --- Cold Start Fallback ---
    if (recommendations.length === 0) {
        recommendations = await Listing.find(baseQuery)
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