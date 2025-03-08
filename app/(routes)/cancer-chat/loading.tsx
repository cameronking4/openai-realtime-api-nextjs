import React from 'react';

export default function CancerChatLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-cancer-accent border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-2xl font-semibold text-cancer-accent">Loading Your Healing Check-in...</h2>
        <p className="text-gray-500">Please wait while we prepare your session</p>
      </div>
    </div>
  );
} 