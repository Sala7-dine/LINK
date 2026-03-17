import React from 'react';

export default function PageHero({ title, description, bgImage, children }) {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-28 mb-12 bg-zinc-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="Cover" className="w-full h-full object-cover opacity-70 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-900/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24 lg:pt-48 lg:pb-32 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
          {title}
        </h1>
        {description && (
          <p className={`text-lg sm:text-xl text-zinc-300 max-w-2xl drop-shadow-md ${children ? 'mb-8' : ''}`}>
            {description}
          </p>
        )}
        {children && (
          <div className="flex justify-center w-full">
            {children}
          </div>
        )}
      </div>

      {/* Curved Bottom Edge */}
      <div className="absolute bottom-0 left-0 w-full z-10 translate-y-[1px]">
        <svg
          className="w-full h-12 sm:h-20 lg:h-32 text-white"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path fill="currentColor" d="M0,100 L0,0 Q720,200 1440,0 L1440,100 Z" />
        </svg>
      </div>
    </div>
  );
}
