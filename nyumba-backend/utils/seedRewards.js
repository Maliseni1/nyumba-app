const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Reward = require('../models/rewardModel');

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');

// --- NEW TENANT REWARDS ---
const rewardsToAdd = [
    {
        title: 'K50 Cashback',
        description: 'Redeem your points for a K50 cashback. Our team will process this manually and send it to your registered number.',
        pointsCost: 500,
        type: 'CASHBACK',
        role: 'tenant', // <-- Only for tenants
        cashValue: 50,
        isActive: true
    },
    {
        title: 'K100 Cashback',
        description: 'Redeem your points for a K100 cashback. Our team will process this manually and send it to your registered number.',
        pointsCost: 950, // Slight discount for bulk
        type: 'CASHBACK',
        role: 'tenant', // <-- Only for tenants
        cashValue: 100,
        isActive: true
    }
];

// --- LANDLORD REWARD (to ensure it's correct) ---
const landlordReward = {
    title: '7-Day Priority Listing',
    description: 'Make your listing a "Priority Listing" for 7 days. It will appear higher in search results.',
    pointsCost: 50,
    type: 'LISTING_PRIORITY',
    role: 'landlord', // <-- MUST be set to 'landlord'
    durationInDays: 7,
    isActive: true
};


const seedData = async () => {
    try {
        await connectDB();
        console.log('Database connected...');

        // 1. Update existing Landlord Reward
        const updatedLandlordReward = await Reward.findOneAndUpdate(
            { type: 'LISTING_PRIORITY' }, // Find the old reward
            { $set: landlordReward },     // Set the new data (including role: 'landlord')
            { upsert: true, new: true, setDefaultsOnInsert: true } // 'upsert: true' creates it if it doesn't exist
        );
        console.log(`Updated/Created Landlord Reward: ${updatedLandlordReward.title}`);

        // 2. Add new Tenant Rewards
        for (const reward of rewardsToAdd) {
            const existing = await Reward.findOne({ title: reward.title });
            if (!existing) {
                await Reward.create(reward);
                console.log(`Created Tenant Reward: ${reward.title}`);
            } else {
                console.log(`Tenant Reward "${reward.title}" already exists. Skipping.`);
            }
        }

        console.log('Reward seeding complete!');
        process.exit();

    } catch (error) {
        console.error('Error seeding rewards:', error.message);
        process.exit(1);
    }
};

seedData();