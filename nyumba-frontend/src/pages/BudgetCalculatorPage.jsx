import React, { useState } from 'react';
import { FaCalculator, FaExclamationTriangle } from 'react-icons/fa';

const BudgetCalculatorPage = () => {
    const [income, setIncome] = useState('');
    const [debts, setDebts] = useState('');
    const [result, setResult] = useState(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        
        const netIncome = parseFloat(income) || 0;
        const monthlyDebts = parseFloat(debts) || 0;

        if (netIncome <= 0) {
            toast.error("Please enter a valid monthly income.");
            return;
        }

        const disposableIncome = netIncome - monthlyDebts;

        if (disposableIncome <= 0) {
            setResult({
                error: "Your debts exceed your income. Please review your entries."
            });
            return;
        }

        // 30% rule - Recommended budget
        const recommendedRent = disposableIncome * 0.30;
        // 40% rule - "Stretched" budget
        const stretchRent = disposableIncome * 0.40;

        setResult({
            recommended: recommendedRent,
            stretch: stretchRent,
            error: null
        });
    };

    // Helper to format currency
    const formatCurrency = (value) => {
        return `K${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const inputStyle = "w-full p-3 bg-bg-color rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-color text-text-color";
    const labelStyle = "block text-sm font-medium text-text-color mb-2";

    return (
        <div className="pt-24 max-w-lg mx-auto pb-12">
            <div className="bg-card-color p-8 rounded-lg border border-border-color backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-text-color text-center mb-6 flex items-center justify-center gap-3">
                    <FaCalculator /> Rent Affordability Calculator
                </h1>
                <p className="text-subtle-text-color text-center mb-6">
                    Find out how much rent you can comfortably afford. This calculator uses the 30% rule (spending no more than 30% of your income on housing).
                </p>

                <form onSubmit={handleCalculate} className="space-y-6">
                    <div>
                        <label htmlFor="income" className={labelStyle}>
                            Your Total Monthly Income (after taxes)
                        </label>
                        <input
                            type="number"
                            id="income"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            placeholder="e.g., 25000"
                            className={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="debts" className={labelStyle}>
                            Total Monthly Debts (Optional)
                        </label>
                        <input
                            type="number"
                            id="debts"
                            value={debts}
                            onChange={(e) => setDebts(e.target.value)}
                            placeholder="e.g., 1500 (loans, etc.)"
                            className={inputStyle}
                        />
                        <p className="text-xs text-subtle-text-color mt-1">
                            Enter any fixed monthly payments like loans or credit cards.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors"
                    >
                        Calculate
                    </button>
                </form>

                {result && (
                    <div className="mt-8 border-t border-border-color pt-6">
                        {result.error ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
                                <FaExclamationTriangle />
                                <span>{result.error}</span>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-bold text-text-color text-center">Your Results</h3>
                                
                                <div className="text-center mt-4 p-6 bg-bg-color border border-border-color rounded-lg">
                                    <p className="text-subtle-text-color">RECOMMENDED RENT</p>
                                    <p className="text-4xl font-bold text-accent-color my-2">
                                        {formatCurrency(result.recommended)} / month
                                    </p>
                                    <p className="text-subtle-text-color">This is 30% of your disposable income.</p>
                                </div>

                                <div className="text-center mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-subtle-text-color">STRETCH BUDGET</p>
                                    <p className="text-2xl font-bold text-yellow-400 my-1">
                                        {formatCurrency(result.stretch)} / month
                                    </p>
                                    <p className="text-yellow-400 text-sm">
                                        This is 40% of your disposable income. This is considered high and may strain your budget.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetCalculatorPage;