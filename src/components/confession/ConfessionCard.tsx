import React, { useState } from 'react';
import { Confession } from '../../types';
import { formatDate, truncateText } from '../../utils/helpers';

interface ConfessionCardProps {
  confession: Confession;
}

const ConfessionCard: React.FC<ConfessionCardProps> = ({ confession }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasAudio = Boolean((confession as any).audio_url || (confession as any).audio_path);

  const shouldTruncate =
    !hasAudio && confession.description && confession.description.length > 200;

  const getGenderIcon = (sex: string) => {
    switch (sex) {
      case 'Male':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 13a2 2 0 114 0 2 2 0 01-4 0z"/>
          </svg>
        );
      case 'Female':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 13a2 2 0 114 0 2 2 0 01-4 0z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 13a2 2 0 114 0 2 2 0 01-4 0z"/>
          </svg>
        );
    }
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {confession.city}
          </span>
          <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
            {getGenderIcon(confession.sex)}
            <span className="ml-2">{confession.sex}</span>
          </span>
          <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {confession.age} years
          </span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
          {formatDate(confession.created_at)}
        </span>
      </div>

      <div className="text-gray-800 leading-relaxed flex-1">
        {(confession as any).audio_url || (confession as any).audio_path ? (
          <audio
            controls
            src={
              (confession as any).audio_url
                ? (confession as any).audio_url
                : `${(confession as any).audio_path}`
            }
            className="w-full mt-2"
          >
            Your browser does not support the audio element.
          </audio>
        ) : (
          <p
            className={`confession-description text-base ${isExpanded ? "expanded" : ""}`}
          >
            {confession.description}
          </p>
        )}
      </div>

      {/* Only show Read More for text confessions */}
      {!hasAudio && shouldTruncate && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm focus:outline-none transition-colors duration-200"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfessionCard;
