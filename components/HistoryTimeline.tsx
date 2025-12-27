
import React from 'react';

interface HistoryTimelineProps {
  history: any[];
  currentIndex: number;
  onJump: (index: number) => void;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, currentIndex, onJump }) => {
  if (history.length < 2) return null;

  return (
    <div className="absolute bottom-20 right-6 w-8 bg-gray-900/40 backdrop-blur-lg border border-gray-800 rounded-full p-2 flex flex-col items-center space-y-2 z-40 pointer-events-auto hover:bg-gray-900/80 transition-all max-h-48 overflow-y-auto">
      {history.map((_, idx) => (
        <button
          key={idx}
          onClick={() => onJump(idx)}
          className={`w-2 h-2 rounded-full transition-all ${
            idx === currentIndex ? 'bg-indigo-500 scale-150 shadow-[0_0_8px_#6366f1]' : 'bg-gray-700 hover:bg-gray-500'
          }`}
          title={`State ${idx + 1}`}
        />
      ))}
    </div>
  );
};

export default HistoryTimeline;
