const asyncHandler = require('express-async-handler');
const Listing = require('../models/listingModel');
const User = require('../models/userModel');
const geocoder = require('../utils/geocoder');
// --- 1. IMPORT NEW MODULES FOR CSV PROCESSING ---
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

// --- Helper function for delay ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    if (!isPremiumTenant) {
        if (filter.$or) {
            filter.$and = [
                { $or: filter.$or }, 
                { $or: [ 
                    { publicReleaseAt: { $lte: new Date() } },
                    { publicReleaseAt: { $exists: false } }
                ]}
            ];
            delete filter.$or; 
        } else {
            filter.$or = [
                { publicReleaseAt: { $lte: new Date() } },
                { publicReleaseAt: { $exists: false } }
            ];
        }
    }
    
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
    const baseQuery = {
        status: 'available',
        _id: { $nin: excludeIds },
        $or: [
            { publicReleaseAt: { $lte: new Date() } },
            { publicReleaseAt: { $exists: false } }
        ]
    };

    if (user.savedListings.length > 0) {
        const totalPrice = user.savedListings.reduce((acc, l) => acc + l.price, 0);
        const avgPrice = totalPrice / user.savedListings.length;
        const minPrice = avgPrice * 0.75;
        const maxPrice = avgPrice * 1.25;

        const typeCounts = user.savedListings.reduce((acc, l) => {
            acc[l.propertyType] = (acc[l.propertyType] || 0) + 1;
            return acc;
        }, {});
        const mostCommonType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b, null);

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

    if (recommendations.length === 0) {
        recommendations = await Listing.find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('owner', 'name profilePicture');
    }
    res.json(recommendations);
});


// --- 2. NEW FUNCTION: Bulk Upload Listings ---
const bulkUploadListings = asyncHandler(async (req, res) => {
    if (req.user.role !== 'landlord') {
        res.status(403);
        throw new Error('Only landlords can bulk upload listings.');
    }
    
    if (!req.file) {
        res.status(400);
        throw new Error('No CSV file uploaded.');
    }

    const listings = [];
    const errors = [];
    let successCount = 0;
    let errorCount = 0;
    const filePath = path.resolve(req.file.path);

    // Wrap the stream in a promise to handle async flow
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true, trim: true }))
            .on('error', (error) => {
                console.error(error);
                reject(new Error('Error parsing CSV file.'));
            })
            .on('data', (row) => {
                // 'data' event is synchronous, so we just collect rows
                listings.push(row);
            })
            .on('end', async (rowCount) => {
                console.log(`Parsed ${rowCount} rows from CSV.`);
                
                // Now, process each row asynchronously with a delay
                for (const row of listings) {
                    try {
                        // --- CRITICAL: 1.1 second delay to respect Nominatim's rate limit ---
                        await delay(1100); 

                        const { title, description, price, location, bedrooms, bathrooms, propertyType } = row;

                        // Basic validation
                        if (!title || !price || !location || !bedrooms || !bathrooms || !propertyType) {
                            throw new Error('Missing required fields (title, price, location, bedrooms, bathrooms, propertyType).');
                        }

                        // Geocode the location
                        const geoData = await geocoder.geocode(location);
                        if (!geoData || !geoData.length) {
                            throw new Error(`Address not found for: ${location}`);
                        }

                        const { longitude, latitude, formattedAddress } = geoData[0];
                        const locationData = {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                            address: formattedAddress || location,
                        };

                        const publicReleaseDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                        // Create and save the new listing
                        const newListing = new Listing({
                            title,
                            description: description || '',
                            price: parseFloat(price),
                            location: locationData,
                            bedrooms: parseInt(bedrooms, 10),
                            bathrooms: parseInt(bathrooms, 10),
                            propertyType,
                            images: [], // Bulk upload does not support images per row
                            owner: req.user._id,
                            publicReleaseAt: publicReleaseDate
                        });

                        await newListing.save();
                        successCount++;

                    } catch (error) {
                        errorCount++;
                        errors.push({ rowTitle: row.title || `Row ${successCount + errorCount}`, error: error.message });
                    }
                }
                resolve(); // Resolve the promise when all rows are processed
            });
    });

    // Clean up the uploaded file
    try {
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error("Error deleting temp CSV file:", err);
    }
    
    res.status(201).json({
        message: `Bulk upload complete. ${successCount} listings created, ${errorCount} failed.`,
        successCount,
        errorCount,
        errors,
    });
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
    bulkUploadListings // <-- 3. EXPORT NEW FUNCTION
};