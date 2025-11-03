const asyncHandler = require('express-async-handler');
const Listing = require('../models/listingModel');
const User = require('../models/userModel');
const geocoder = require('../utils/geocoder'); 

const getListings = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query;
    let filter = {};
    if (searchTerm) {
        filter = {
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { 'location.address': { $regex: searchTerm, $options: 'i' } }
            ]
        };
    }
    const listings = await Listing.find({ ...filter, owner: { $ne: null } })
        .populate('owner', 'name profilePicture')
        .sort({ createdAt: -1 });
    res.json(listings);
});

// --- 1. NEW FUNCTION FOR PROXIMITY SEARCH ---
const getListingsNearby = asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        res.status(400);
        throw new Error('Please provide latitude and longitude');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Find listings near the user's location
    const listings = await Listing.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
                distanceField: 'distance', // Adds a 'distance' field (in meters)
                maxDistance: 100000, // Find listings within 100km (100,000 meters)
                spherical: true,
            },
        },
        { $sort: { distance: 1 } }, // Sort by distance, nearest first
        {
            $lookup: { // Populate the 'owner' field
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerDetails',
            },
        },
        {
            $unwind: { // Unwind the owner array
                path: '$ownerDetails',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: { // Reshape the output to be clean
                title: 1,
                price: 1,
                location: 1,
                bedrooms: 1,
                bathrooms: 1,
                propertyType: 1,
                images: 1,
                createdAt: 1,
                distance: 1, // Include the calculated distance
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
// --- END OF NEW FUNCTION ---

const getListingById = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate('owner', '_id name profilePicture');
    if (listing) {
        res.json(listing);
    } else {
        res.status(404);
        throw new Error('Listing not found');
    }
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
    
    const newListing = new Listing({
        title,
        description,
        price,
        location: locationData,
        bedrooms,
        bathrooms,
        propertyType,
        images,
        owner: req.user._id
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

module.exports = {
    getListings,
    getListingsNearby, // <-- 2. EXPORT THE NEW FUNCTION
    getListingById,
    createListing,
    updateListing,
    deleteListing,
};