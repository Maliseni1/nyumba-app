const asyncHandler = require('express-async-handler');
// --- 1. FIX THE LISTING IMPORT ---
const { Listing } = require('../models/listingModel');
const User = require('../models/userModel');
// --- 2. IMPORT NEW MODELS/UTILS ---
const TenantPreference = require('../models/tenantPreferenceModel');
const sendEmail = require('../utils/sendEmail');
const geocoder = require('../utils/geocoder');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

// --- Helper function for delay ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 3. NEW HELPER FUNCTION: Smart Match Notifier ---
const findAndNotifyMatches = async (listing) => {
    try {
        // 1. Build the matching query
        const query = {
            notifyImmediately: true,
            
            // Price: Find prefs where listing price is within range
            $or: [
                { maxPrice: { $exists: false } }, // No max price set
                { maxPrice: null }, // No max price set
                { maxPrice: { $gte: listing.price } } // Listing price is <= pref max
            ],
            minPrice: { $lte: listing.price }, // Listing price is >= pref min
            
            // Beds/Baths: Find prefs where listing has >= required
            minBedrooms: { $lte: listing.bedrooms },
            minBathrooms: { $lte: listing.bathrooms },
        };

        // 2. Property Types: If pref has types, listing must be one of them
        query['$and'] = [
            { $or: [
                { propertyTypes: { $exists: false } },
                { propertyTypes: { $size: 0 } }, // No property types specified
                { propertyTypes: listing.propertyType } // Listing type is in pref list
            ]}
        ];

        // 3. Amenities: Listing must have ALL amenities the tenant requires
        query['$and'].push(
            { $or: [
                { amenities: { $exists: false } },
                { amenities: { $size: 0 } }, // No amenities required
                { amenities: { $not: { $elemMatch: { $nin: listing.amenities || [] } } } } // All required amenities are in the listing's amenities
            ]}
        );

        // 4. Location: Simple text match (case-insensitive)
        if (listing.location && listing.location.address) {
            // Build a regex to match any part of the address (e.g., "Roma" or "Lusaka")
            const locationTerms = listing.location.address.split(',').map(term => term.trim()).filter(Boolean);
            const locationRegex = new RegExp(locationTerms.join('|'), 'i');

            query['$and'].push(
                { $or: [
                    { location: { $exists: false } },
                    { location: '' }, // No location specified
                    { location: locationRegex } // Matches part of the preference
                ]}
            );
        }

        // 5. Find all matching preferences and populate the user's email
        const matches = await TenantPreference.find(query).populate('user', 'name email');

        if (matches.length === 0) {
            console.log(`No matches found for new listing: ${listing.title}`);
            return;
        }

        console.log(`Found ${matches.length} matches for new listing: ${listing.title}`);

        // 6. Send email to each matched user
        for (const pref of matches) {
            if (pref.user && pref.user.email) {
                const listingUrl = `${process.env.FRONTEND_URL}/listing/${listing._id}`;
                const message = `
                    <h1>New Property Match!</h1>
                    <p>Hi ${pref.user.name},</p>
                    <p>A new property that matches your preferences has just been listed on Nyumba:</p>
                    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                        <h3>${listing.title}</h3>
                        <p><strong>Price:</strong> K${listing.price.toLocaleString()}</p>
                        <p><strong>Location:</strong> ${listing.location.address}</p>
                        <p><strong>Beds:</strong> ${listing.bedrooms} | <strong>Baths:</strong> ${listing.bathrooms}</p>
                    </div>
                    <br>
                    <a href="${listingUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Listing
                    </a>
                    <br>
                    <p style="font-size: 12px; color: #888;">
                        To stop these notifications, you can update your preferences in your profile.
                    </p>
                `;

                try {
                    // Do not wait for the email to send, just fire it off
                    sendEmail({
                        email: pref.user.email,
                        subject: `New Match Found: ${listing.title}`,
                        html: message,
                    });
                } catch (emailError) {
                    console.error(`Failed to send match email to ${pref.user.email}:`, emailError);
                }
            }
        }

    } catch (error) {
        console.error("Error in findAndNotifyMatches:", error);
    }
};
// --- END OF HELPER FUNCTION ---


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
    // --- 4. GET AMENITIES from req.body ---
    const { title, description, price, location, bedrooms, bathrooms, propertyType, amenities } = req.body;
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
    const publicReleaseDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newListing = new Listing({
        title, description, price, location: locationData, bedrooms, bathrooms, propertyType, images,
        amenities: amenities || [], // <-- 5. Save amenities
        owner: req.user._id,
        publicReleaseAt: publicReleaseDate 
    });

    const createdListing = await newListing.save();
    const user = await User.findById(req.user._id);
    user.listings.push(createdListing._id);
    await user.save();
    
    // --- 6. TRIGGER SMART MATCH (don't wait for it) ---
    // We run this in the background and don't await it,
    // so the landlord gets a fast response.
    findAndNotifyMatches(createdListing);

    res.status(201).json(createdListing);
});

const updateListing = asyncHandler(async (req, res) => {
    // --- 7. GET AMENITIES from req.body ---
    const { title, description, price, location, bedrooms, bathrooms, propertyType, existingImages, amenities } = req.body;
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
    listing.amenities = amenities || []; // <-- 8. Save amenities on update
    
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

    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true, trim: true }))
            .on('error', (error) => {
                console.error(error);
                reject(new Error('Error parsing CSV file.'));
            })
            .on('data', (row) => {
                listings.push(row);
            })
            .on('end', async (rowCount) => {
                console.log(`Parsed ${rowCount} rows from CSV.`);
                
                for (const row of listings) {
                    try {
                        await delay(1100); 

                        // --- 9. ADD AMENITIES TO BULK UPLOAD ---
                        const { title, description, price, location, bedrooms, bathrooms, propertyType, amenities } = row;

                        if (!title || !price || !location || !bedrooms || !bathrooms || !propertyType) {
                            throw new Error('Missing required fields (title, price, location, bedrooms, bathrooms, propertyType).');
                        }

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

                        const publicReleaseDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
                        
                        // Parse amenities from CSV (e.g., "WiFi,Pet Friendly")
                        const amenitiesArray = amenities ? amenities.split(',').map(a => a.trim()) : [];

                        const newListing = new Listing({
                            title,
                            description: description || '',
                            price: parseFloat(price),
                            location: locationData,
                            bedrooms: parseInt(bedrooms, 10),
                            bathrooms: parseInt(bathrooms, 10),
                            propertyType,
                            images: [],
                            amenities: amenitiesArray, // <-- 10. Save amenities
                            owner: req.user._id,
                            publicReleaseAt: publicReleaseDate
                        });

                        const createdListing = await newListing.save();
                        successCount++;
                        
                        // --- 11. TRIGGER SMART MATCH (don't wait for it) ---
                        // We run this in the background and don't await it
                        findAndNotifyMatches(createdListing);

                    } catch (error) {
                        errorCount++;
                        errors.push({ rowTitle: row.title || `Row ${successCount + errorCount}`, error: error.message });
                    }
                }
                resolve();
            });
    });

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
    bulkUploadListings
};