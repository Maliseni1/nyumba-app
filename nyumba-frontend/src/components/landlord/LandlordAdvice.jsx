import React from 'react';
import { FaLightbulb, FaCamera, FaWhatsapp } from 'react-icons/fa';

const AdviceItem = ({ icon, title, children }) => (
    <li className="flex gap-4">
        <div className="pt-1">
            {icon}
        </div>
        <div>
            {/* --- 1. UPDATED TEXT --- */}
            <h4 className="font-bold text-text-color">{title}</h4>
            <p className="text-subtle-text-color">{children}</p>
        </div>
    </li>
);

const LandlordAdvice = () => {
    return (
        // --- 2. UPDATED CARD ---
        <div className="bg-card-color p-8 rounded-lg border border-border-color">
            {/* --- 3. UPDATED HEADER --- */}
            <h2 className="text-2xl font-bold text-text-color mb-6 flex items-center gap-2">
                <FaLightbulb className="text-yellow-400" /> {/* Semantic color is fine */}
                How to Improve Your Reach
            </h2>
            <ul className="space-y-6">
                {/* Semantic icon colors are fine */}
                <AdviceItem icon={<FaCamera className="text-sky-400" />} title="Upload High-Quality Photos">
                    Listings with 5 or more bright, clear photos get 3x more views. Make sure to include the kitchen, bathrooms, and bedrooms.
                </AdviceItem>
                <AdviceItem icon={<FaWhatsapp className="text-green-400" />} title="Add Your WhatsApp Number">
                    Tenants love to connect instantly. Add your WhatsApp number to your profile to get more inquiries, faster.
                </AdviceItem>
                <AdviceItem icon={<FaLightbulb className="text-yellow-400" />} title="Write a Detailed Description">
                    Don't just list features. Describe the neighborhood, nearby shops, and what makes your property unique.
                </AdviceItem>
            </ul>
        </div>
    );
};

export default LandlordAdvice;