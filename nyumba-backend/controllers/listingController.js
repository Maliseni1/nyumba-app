const asyncHandler = require('express-async-handler');
const Listing = require('../models/listingModel');

// @desc    Fetch all listings
// @route   GET /api/listings
// @access  Public
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

    // This query is now more robust. It will filter out any listings
    // that have a missing or invalid owner before attempting to populate.
    const listings = await Listing.find({ ...filter, owner: { $ne: null } })
        .populate('owner', 'name profilePicture')
        .sort({ createdAt: -1 });

    res.json(listings);
});

// @desc    Fetch single listing
// @route   GET /api/listings/:id
// @access  Public
const getListingById = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate('owner', '_id name profilePicture');
    if (listing) {
        res.json(listing);
    } else {
        res.status(404);
        throw new Error('Listing not found');
    }
});

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private
const createListing = asyncHandler(async (req, res) => {
    const { title, description, price, location, bedrooms, bathrooms, propertyType } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];
    const newListing = new Listing({
        title, description, price, location, bedrooms, bathrooms, propertyType,
        images,
        owner: req.user._id
    });
    const createdListing = await newListing.save();
    res.status(201).json(createdListing);
});

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
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

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.owner.toString() !== req.user._id.toString()) {
        res.status(401); throw new Error('Not authorized');
    }
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