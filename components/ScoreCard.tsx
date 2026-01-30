import React from 'react';
import { Criterion } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface ScoreCardProps {
  criterion: Criterion;
  onChange: (id: string, newScore: number) => void;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ criterion, onChange }) => {
  const percentage = (criterion.currentScore / criterion.maxScore) * 100;
  
  // Determine color based on percentage
  let statusColor = "bg-red-500";
  if (percentage >= 80) statusColor = "bg-green-500";
  else if (percentage >= 60) statusColor = "bg-yellow-500";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-400 group">
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-700 text-sm leading-tight mb-1 group-hover:text-blue-700 transition-colors">
            {criterion.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2" title={criterion.description}>
            {criterion.description}
          </p>
        </div>
        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${statusColor} bg-opacity-10`}>
             <CheckCircle2 className={`w-3.5 h-3.5 ${statusColor.replace('bg-', 'text-')}`} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-xs font-medium text-slate-500">Điểm số</span>
          <div className="flex items-baseline space-x-1">
            <input 
              type="number" 
              value={criterion.currentScore}
              onChange={(e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val)) val = 0;
                if (val > criterion.maxScore) val = criterion.maxScore;
                if (val < 0) val = 0;
                onChange(criterion.id, val);
              }}
              className="w-16 text-right font-bold text-lg text-slate-800 border-b border-transparent focus:border-blue-500 focus:outline-none bg-transparent hover:border-slate-300 p-0"
              step="0.1"
              max={criterion.maxScore}
              min={0}
            />
            <span className="text-xs text-slate-400 font-medium">/ {criterion.maxScore}</span>
          </div>
        </div>

        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: criterion.color 
            }}
          />
        </div>
        
        <input 
          type="range"
          min="0"
          max={criterion.maxScore}
          step="0.1"
          value={criterion.currentScore}
          onChange={(e) => onChange(criterion.id, parseFloat(e.target.value))}
          className="w-full mt-2 accent-blue-600 cursor-pointer h-4 bg-transparent appearance-none [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:-mt-1.5"
        />
      </div>
    </div>
  );
};