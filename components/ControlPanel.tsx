
import React from 'react';
import { Icons } from '../constants';

const ControlPanel: React.FC = () => {
  return (
    <div className="absolute top-20 left-20 w-64 bg-gray-900/90 backdrop-blur-lg border border-gray-800 rounded-xl p-4 z-40 shadow-2xl pointer-events-auto">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Workspace Config</span>
        <button className="text-gray-600 hover:text-white"><Icons.X /></button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-gray-600 uppercase">Neural Sensitivity</label>
          <div className="flex items-center space-x-3">
             <input type="range" className="flex-1 accent-indigo-500 h-1 bg-gray-800 rounded-full" />
             <span className="text-[10px] font-mono text-gray-400">0.85</span>
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-[9px] font-bold text-gray-600 uppercase">Segmentation Mode</label>
           <select className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-[10px] text-gray-300 focus:outline-none">
             <option>Balanced (Standard)</option>
             <option>Aggressive (Deep Detail)</option>
             <option>Semantic (Object Grouping)</option>
           </select>
        </div>

        <div className="p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
           <div className="flex items-center space-x-2 mb-1">
             <Icons.Info />
             <span className="text-[9px] font-bold text-indigo-400 uppercase">Pro Tip</span>
           </div>
           <p className="text-[9px] text-gray-400 leading-relaxed">
             Enable "Aggressive Mode" for complex backgrounds like foliage or intricate furniture.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
