// src/components/simulators/SystemToggle.jsx
import React, { useState } from 'react';

const SystemToggle = ({ config }) => {
  const [activeToggles, setActiveToggles] = useState({});

  const handleToggle = (id) => {
    setActiveToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allRequiredActive = config.toggles
    .filter(t => t.required)
    .every(t => activeToggles[t.id]);

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-lg">
      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">System Inputs</h4>
      <div className="space-y-3 mb-6">
        {config.toggles.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-medium text-gray-700">{t.label}</span>
            <button
              onClick={() => handleToggle(t.id)}
              className={`w-12 h-6 rounded-full transition-colors relative ${activeToggles[t.id] ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${activeToggles[t.id] ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded text-center transition-all ${allRequiredActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
        <span className="text-xs font-bold uppercase tracking-widest block mb-1">System Status</span>
        <p className="font-medium">{allRequiredActive ? config.successOutput : config.failureOutput}</p>
      </div>
    </div>
  );
};

export default SystemToggle;