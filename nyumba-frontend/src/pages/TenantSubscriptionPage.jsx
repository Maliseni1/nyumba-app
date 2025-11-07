import React, { useState } from 'react';
import { FaCheck, FaCrown, FaShieldAlt, FaRocket, FaUserCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';
import PaymentConfirmation from '../components/PaymentConfirmation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TenantSubscriptionPage = () => {
    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { authUser } = useAuth();
    const navigate = useNavigate();

    // --- NEW: Tenant plans ---
    const subscriptionPlans = {
        monthly: {
            id: 'tenant_monthly',
            name: 'Monthly Premium',
            price: 0.99,
            originalPrice: 0.99,
            period: 'month',
            discount: 0,
            popular: false,
            description: 'Get an edge in your search',
            features: [
                '24-Hour Early Access to new listings',
                'Instant Email & Push Notifications',
                'Verified Tenant Badge on profile',
                'Priority in Landlord Inboxes'
            ],
            type: 'tenant_premium' // <-- This is the important part
        },
        yearly: {
            id: 'tenant_yearly',
            name: 'Yearly Premium',
            price: 9.99,
            originalPrice: 11.88,
            period: 'year',
            discount: 16,
            popular: true,
            description: 'Best value - Save $1.89 per year!',
            features: [
                'Everything in Monthly Premium',
                'Advanced Search Filters',
                'Profile Boost for 3 applications',
                'Premium Support'
            ],
            type: 'tenant_premium' // <-- This is the important part
        }
    };

    const handleSubscribe = (plan) => {
        if (!authUser) {
            toast.info("Please log in to subscribe.");
            navigate('/login', { state: { redirectTo: '/subscription/tenant' } });
            return;
        }

        const subscriptionData = {
            planId: plan.id,
            planName: plan.name,
            amount: plan.price.toString(),
            period: plan.period,
            discount: plan.discount,
            subscriptionType: plan.type, // <-- Passes 'tenant_premium'
            userId: authUser._id // Pass user ID
        };
        setPaymentData(subscriptionData);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (payment) => { /* ... */ };
    const handlePaymentClose = () => { /* ... */ };
    const handleConfirmationClose = () => { /* ... */ };

    // --- Pricing Card Sub-Component (now themed) ---
    const PricingCard = ({ plan, isSelected, onSelect }) => (
        <div className={`relative bg-card-color rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isSelected ? 'border-accent-color shadow-2xl dark:shadow-blue-500/20' : 'border-border-color hover:border-border-color'
        } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}>
            
            {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <FaCrown className="w-4 h-4" /> Most Popular
                    </div>
                </div>
            )}
            <div className="p-8">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-text-color mb-2">{plan.name}</h3>
                    <p className="text-subtle-text-color mb-4">{plan.description}</p>
                    <div className="mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-4xl font-bold text-text-color">${plan.price}</span>
                            <span className="text-subtle-text-color">/{plan.period}</span>
                        </div>
                        {plan.discount > 0 && ('')}
                    </div>
                    <button
                        onClick={() => onSelect(plan)}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                            isSelected
                                ? 'bg-accent-color hover:bg-accent-hover-color text-white'
                                : 'bg-bg-color border border-border-color hover:bg-border-color text-text-color'
                        }`}
                    >
                        {isSelected ? 'Selected Plan' : 'Choose Plan'}
                    </button>
                </div>
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-text-color mb-4">What's included:</h4>
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <FaCheck className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-subtle-text-color">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    // --- End of Pricing Card ---

    return (
        <div className="pt-24 min-h-screen">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-color/10 to-emerald-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-text-color mb-6">
                            Tenant <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Premium</span>
                        </h1>
                        <p className="text-xl text-subtle-text-color mb-8 max-w-3xl mx-auto">
                            Find your next home faster. Get early access to listings and make your application stand out.
                        </p>
                        
                        <div className="inline-flex bg-bg-color border border-border-color rounded-xl p-2 mb-12">
                            <button
                                onClick={() => setSelectedPlan('monthly')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                    selectedPlan === 'monthly'
                                    ? 'bg-accent-color text-white shadow-lg'
                                    : 'text-subtle-text-color hover:text-text-color'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setSelectedPlan('yearly')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 relative ${
                                    selectedPlan === 'yearly'
                                    ? 'bg-accent-color text-white shadow-lg'
                                    : 'text-subtle-text-color hover:text-text-color'
                                }`}
                            >
                                Yearly
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Save 16%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <PricingCard
                        plan={subscriptionPlans.monthly}
                        isSelected={selectedPlan === 'monthly'}
                        onSelect={() => setSelectedPlan('monthly')}
                    />
                    <PricingCard
                        plan={subscriptionPlans.yearly}
                        isSelected={selectedPlan === 'yearly'}
                        onSelect={() => setSelectedPlan('yearly')}
                    />
                </div>

                <div className="text-center mt-12">
                    <button
                        onClick={() => handleSubscribe(subscriptionPlans[selectedPlan])}
                        className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                        Subscribe to {subscriptionPlans[selectedPlan].name}
                    </button>
                    <p className="text-subtle-text-color mt-4">
                        Secure payment powered by Base Pay • Cancel anytime
                    </p>
                </div>
            </div>

            {/* ... (Payment Modals are unchanged) ... */}
        </div>
    );
};

export default TenantSubscriptionPage;