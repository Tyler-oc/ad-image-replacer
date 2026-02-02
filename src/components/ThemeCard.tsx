import React from 'react';
import { Check } from 'lucide-react';

interface ThemeCardProps {
  id: string;
  name: string;
  previewUrl: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ id, name, previewUrl, isActive, onSelect, disabled }) => {
  return (
    <div 
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200
        ${isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !disabled && onSelect(id)}
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img 
          src={previewUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-3 bg-white flex items-center justify-between">
        <span className="font-medium text-gray-700">{name}</span>
        {isActive && (
          <div className="bg-blue-500 text-white p-1 rounded-full">
            <Check size={14} />
          </div>
        )}
      </div>

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Locked</span>
        </div>
      )}
    </div>
  );
};

export default ThemeCard;
