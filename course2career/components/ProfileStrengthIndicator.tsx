import React, { useState } from 'react';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import type { Suggestion, SuggestionAction } from '../types';

interface ProfileStrengthIndicatorProps {
  percentage: number;
  label: string;
  suggestions: Suggestion[];
  onActionClick: (action: SuggestionAction) => void;
}

const ProfileStrengthIndicator: React.FC<ProfileStrengthIndicatorProps> = ({ percentage, label, suggestions, onActionClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorClass = percentage >= 95 ? 'bg-green-600' : percentage >= 70 ? 'bg-primary' : 'bg-orange-500';

  return (
    <div className="bg-secondary dark:bg-slate-700/50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Profile Strength: <span className="font-bold">{label}</span></span>
            <span className={`text-sm font-bold ${colorClass.replace('bg-', 'text-')}`}>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2.5 mt-2">
            <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
        {suggestions.length > 0 && (
            <div className="mt-3">
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-sm font-semibold text-primary hover:underline">
                    <span>How to improve your profile</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="mt-3 space-y-2 animate-fade-in" style={{animationDuration: '300ms'}}>
                        {suggestions.map((suggestion, index) => (
                            <button 
                                key={index} 
                                onClick={() => onActionClick(suggestion.action)}
                                className="flex items-start text-left w-full p-2 rounded-md hover:bg-primary/10 group"
                            >
                                <LightBulbIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">{suggestion.text}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}
        {suggestions.length === 0 && (
             <div className="mt-3 flex items-center text-sm font-semibold text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span>Your profile is looking great!</span>
            </div>
        )}
    </div>
  );
};

export default ProfileStrengthIndicator;