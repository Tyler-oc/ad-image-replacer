import React from 'react';
import { Settings } from 'lucide-react';

const Popup = () => {
  const openOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  return (
    <div className="w-[300px] p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Ad Replacer</h1>
        <button 
          onClick={openOptions}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Open Settings"
        >
          <Settings size={20} />
        </button>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
        <p className="text-sm text-blue-800">
          Extension is active. Ad images are being replaced with your selected theme.
        </p>
      </div>

      <button
        onClick={openOptions}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Customize Theme
      </button>
    </div>
  );
};

export default Popup;
