import React, { useState } from 'react';
import { FaCheck, FaCrown, FaShieldAlt, FaUsers, FaChartLine, FaHeadset, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';
import PaymentConfirmation from '../components/PaymentConfirmation';
import paymentService from '../services/paymentService';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Subscription plans configuration
  const subscriptionPlans = {
    monthly: {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 1.99,
      originalPrice: 1.99,
      period: 'month',
      discount: 0,
      popular: false,
      description: 'Perfect for trying out premium features',
      features: [
        'Unlimited property listings',
        'Priority customer support',
        'Advanced search filters',
        'Verified badge',
        'Analytics dashboard',
        'Direct messaging with tenants',
        'Photo enhancement tools',
        'Featured listing placement'
      ]
    },
    yearly: {
      id: 'yearly',
      name: 'Yearly Premium',
      price: 19.99,
      originalPrice: 23.88,
      period: 'year',
      discount: 17,
      popular: true,
      description: 'Best value - Save $4 per year!',
      features: [
        'Everything in Monthly Premium',
        'Priority listing placement',
        'Advanced analytics & insights',
        'Bulk property management',
        'API access for integrations',
        'White-label solutions',
        'Dedicated account manager',
        'Custom branding options',
        '24/7 phone support'
      ]
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setShowPaymentModal(true);
      
      // Create subscription payment data
      const subscriptionData = {
        planId: plan.id,
        planName: plan.name,
        amount: plan.price.toString(),
        period: plan.period,
        discount: plan.discount,
        type: 'subscription'
      };

      setPaymentData(subscriptionData);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to initiate subscription. Please try again.');
    }
  };

  const handlePaymentSuccess = (payment) => {
    setShowPaymentModal(false);
    setShowConfirmation(true);
    setPaymentData({
      ...paymentData,
      transactionId: payment.transactionId,
      payerInfo: payment.payerInfo
    });
    toast.success('Subscription activated successfully!');
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setPaymentData(null);
  };

  const PricingCard = ({ plan, isSelected, onSelect }) => (
    <div className={`relative bg-slate-800 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
      isSelected ? 'border-blue-500 shadow-2xl shadow-blue-500/20' : 'border-slate-700 hover:border-slate-600'
    } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}>
      
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
            <FaCrown className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Plan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-gray-400 mb-4">{plan.description}</p>
          
          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="text-gray-400">/{plan.period}</span>
            </div>
            
            {plan.discount > 0 && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-500 line-through text-lg">${plan.originalPrice}</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  Save {plan.discount}%
                </span>
              </div>
            )}
          </div>

          {/* Subscribe Button */}
          <button
            onClick={() => onSelect(plan)}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
              isSelected
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {isSelected ? 'Selected Plan' : 'Choose Plan'}
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white mb-4">What's included:</h4>
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <FaCheck className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Premium</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Unlock powerful features to grow your rental business. Get more visibility, better tools, and premium support.
            </p>
            
            {/* Plan Toggle */}
            <div className="inline-flex bg-slate-800 rounded-xl p-2 mb-12">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedPlan === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
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

        {/* Subscribe Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => handleSubscribe(subscriptionPlans[selectedPlan])}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Subscribe to {subscriptionPlans[selectedPlan].name}
          </button>
          <p className="text-gray-400 mt-4">
            Secure payment powered by Base Pay • Cancel anytime
          </p>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="bg-slate-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Why Choose Premium?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of successful property owners who trust Nyumba Premium to grow their rental business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaChartLine className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-400">
                Get detailed insights into your property performance, tenant engagement, and market trends.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Priority Support</h3>
              <p className="text-gray-400">
                Get help when you need it with our dedicated premium support team available 24/7.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Verified Badge</h3>
              <p className="text-gray-400">
                Build trust with potential tenants with your verified premium badge and enhanced profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          listing={{
            title: paymentData.planName,
            location: 'Nyumba Premium Subscription',
            price: paymentData.amount,
            images: []
          }}
          paymentType="subscription"
          onPaymentSuccess={handlePaymentSuccess}
          customAmount={paymentData.amount}
          subscriptionData={paymentData}
        />
      )}

      {/* Payment Confirmation */}
      {showConfirmation && paymentData && (
        <PaymentConfirmation
          paymentData={paymentData}
          listing={{
            title: paymentData.planName,
            location: 'Nyumba Premium Subscription',
            price: paymentData.amount,
            images: []
          }}
          onClose={handleConfirmationClose}
          showStatusTracker={true}
        />
      )}
    </div>
  );
};

export default SubscriptionPage;