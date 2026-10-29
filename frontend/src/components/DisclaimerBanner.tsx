import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  className?: string;
  moduleSpecificNote?: string;
}

export const DisclaimerBanner: React.FC<Props> = ({ className = '', moduleSpecificNote }) => {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-semibold text-amber-950">Educational & Research Prototype: </span>
          HeartHealth AI is engineered solely for academic and demonstrative purposes. It does not provide medical diagnoses, treatment recommendations, or clinical prognoses.
          {moduleSpecificNote && <span className="block mt-1 font-medium">{moduleSpecificNote}</span>}
          <span className="block mt-1 text-amber-800">
            For all cardiovascular symptoms or health concerns, consult a licensed cardiologist or qualified medical practitioner.
          </span>
        </div>
      </div>
    </div>
  );
};
