const asyncHandler = require('express-async-handler');
const Listing = require('../models/listingModel');
const User = require('../models/userModel'); // --- NEW IMPORT ---

const getListings = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query;
    let filter = {};
    if (searchTerm) {
        filter = {
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } }
            ]
        };
    }
    const listings = await Listing.find({ ...filter, owner: { $ne: null } })
        .populate('owner', 'name profilePicture')
        .sort({ createdAt: -1 });
    res.json(listings);
});

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
    // --- NEW SECURITY CHECK ---
    if (req.user.role !== 'landlord') {
        res.status(403); // Forbidden
        throw new Error('Only landlords can create listings.');
    }

    const { title, description, price, location, bedrooms, bathrooms, propertyType } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];
    const newListing = new Listing({
        title, description, price, location, bedrooms, bathrooms, propertyType,
        images,
        owner: req.user._id
    });
    const createdListing = await newListing.save();
    
    // --- NEW: Add listing to user's profile ---
    const user = await User.findById(req.user._id);
    user.listings.push(createdListing._id);
    await user.save();

    res.status(201).json(createdListing);
});

const updateListing = asyncHandler(async (req, res) => {
    const { title, description, price, location, bedrooms, bathrooms, propertyType, existingImages } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.owner.toString() !== req.user._id.toString()) {
        res.status(401); throw new Error('Not authorized');
    }
    let newImages = req.files ? req.files.map(file => file.path) : [];
    const updatedImages = existingImages ? (Array.isArray(existingImages) ? [...existingImages, ...newImages] : [existingImages, ...newImages]) : newImages;

    listing.title = title;
    listing.description = description;
    listing.price = price;
    listing.location = location;
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
        res.status(401); throw new Error('Not authorized');
    }

    // --- NEW: Remove listing from user's profile ---
    const user = await User.findById(req.user._id);
    user.listings.pull(listing._id);
    await user.save();

    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
});

module.exports = {
    getListings,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
};