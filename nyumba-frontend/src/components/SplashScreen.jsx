import React from 'react';

const SplashScreen = ({ isLoading }) => {
  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center 
        bg-bg-color transition-opacity duration-500 ease-in-out
        ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* Logo with fade-in animation */}
      <img 
        src="/logo.png" 
        alt="Nyumba Logo" 
        className={`
          w-24 h-24 logo-glow transition-all duration-1000 ease-in-out
          ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
        `} 
      />
      
      {/* "from Chiza Labs" text, similar to "from Meta" */}
      <div 
        className={`
          absolute bottom-10 text-center transition-opacity duration-500 ease-in-out
          ${isLoading ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ transitionDelay: '250ms' }} // Make it appear slightly after the logo
      >
        <p className="text-sm text-subtle-text-color">from</p>
        <p className="text-lg font-bold text-text-color tracking-wide">Chiza Labs</p>
      </div>
    </div>
  );
};
export default SplashScreen;