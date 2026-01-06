// src/components/simulators/Lever.jsx
import React, { useState } from 'react';

const Lever = ({ config }) => {
  const [value, setValue] = useState(config.startValue || 50);

  // Logic to determine which feedback text to show
  const getFeedback = () => {
    if (value <= 25) return config.feedback.low;
    if (value >= 75) return config.feedback.high;
    return config.feedback.mid;
  };

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          {config.label}: <span className="text-blue-600 font-bold">{value}{config.unit}</span>
        </label>
        <input
          type="range"
          min={config.min}
          max={config.max}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="p-4 bg-gray-50 rounded border-l-4 border-blue-500">
        <p className="text-gray-700 text-sm leading-relaxed italic">
          "{getFeedback()}"
        </p>
      </div>
    </div>
  );
};

export default Lever;