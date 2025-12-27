
import React, { useState } from 'react';
import { Layer } from '../types';
import { Icons } from '../constants';

interface ObjectInspectorProps {
  layer: Layer | null;
  onUpdate: (id: string, updates: Partial<Layer>) => void;
  onFinalize: () => void;
}

/**
 * ObjectInspector provides granular control over layer-specific parameters.
 * Integrated with VisionLayer AI metrics for semantic object properties.
 */
const ObjectInspector: React.FC<ObjectInspectorProps> = ({ layer, onUpdate, onFinalize }) => {
  const [activeTab, setActiveTab] = useState<'TRANSFORM' | 'FILTERS' | 'AI'>('TRANSFORM');

  if (!layer) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="text-gray-600 opacity-20">
          <Icons.MousePointer />
        </div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest leading-loose">
          Select an entity to inspect its visual parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full z-40 overflow-y-auto scrollbar-thin">
      <div className="flex bg-gray-950 border-b border-gray-800">
         {(['TRANSFORM', 'FILTERS', 'AI'] as const).map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${
               activeTab === tab ? 'text-indigo-400 bg-gray-900 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-gray-400'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      <div className="p-6">
        {activeTab === 'TRANSFORM' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
             <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-600 uppercase mb-2">Position X</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 font-mono" 
                      value={Math.round(layer.x)} 
                      onChange={(e) => onUpdate(layer.id, { x: Number(e.target.value) })}
                      onBlur={onFinalize}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-600 uppercase mb-2">Position Y</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 font-mono" 
                      value={Math.round(layer.y)} 
                      onChange={(e) => onUpdate(layer.id, { y: Number(e.target.value) })}
                      onBlur={onFinalize}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-600 uppercase mb-2">Width</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 font-mono" 
                      value={Math.round(layer.width)} 
                      onChange={(e) => onUpdate(layer.id, { width: Number(e.target.value) })}
                      onBlur={onFinalize}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-600 uppercase mb-2">Height</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 font-mono" 
                      value={Math.round(layer.height)} 
                      onChange={(e) => onUpdate(layer.id, { height: Number(e.target.value) })}
                      onBlur={onFinalize}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Lock Aspect Ratio</span>
                   <div className="w-8 h-4 bg-indigo-600 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                   </div>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'FILTERS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
             <section className="space-y-4">
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                      <span>Opacity</span>
                      <span className="text-indigo-400">{Math.round(layer.opacity * 100)}%</span>
                   </div>
                   <input 
                      type="range" 
                      min="0" max="1" step="0.01"
                      value={layer.opacity}
                      onChange={(e) => onUpdate(layer.id, { opacity: parseFloat(e.target.value) })}
                      onBlur={onFinalize}
                      className="w-full h-1 bg-gray-800 rounded-full accent-indigo-500" 
                    />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                      <span>Rotation</span>
                      <span className="text-indigo-400">{Math.round(layer.rotation)}°</span>
                   </div>
                   <input 
                      type="range" 
                      min="0" max="360"
                      value={layer.rotation}
                      onChange={(e) => onUpdate(layer.id, { rotation: parseInt(e.target.value) })}
                      onBlur={onFinalize}
                      className="w-full h-1 bg-gray-800 rounded-full accent-indigo-500" 
                    />
                </div>
             </section>
             
             <button className="w-full py-2 bg-gray-800 border border-gray-700 rounded-lg text-[10px] font-bold uppercase hover:bg-gray-700 transition-colors">
               Reset Filters
             </button>
          </div>
        )}

        {activeTab === 'AI' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
             <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl space-y-4">
                <div className="flex items-center space-x-2">
                   <Icons.Sparkles />
                   <span className="text-xs font-bold text-indigo-100">AI Context Analysis</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                   VisionLayer determined this is a <span className="text-indigo-400">"{layer.name}"</span>.
                </p>
                <div className="space-y-1">
                   <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Semantic Tags</span>
                   <div className="flex flex-wrap gap-2">
                      {layer.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-800 rounded text-[9px] text-indigo-300 border border-indigo-500/30">#{tag}</span>
                      ))}
                      <button className="px-2 py-0.5 bg-indigo-600 text-[9px] text-white rounded">+</button>
                   </div>
                </div>
             </div>

             <section className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Description Override</label>
                <textarea 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 h-24 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Describe the object for better AI understanding..."
                  defaultValue={layer.description}
                  onBlur={(e) => {
                    onUpdate(layer.id, { description: e.target.value });
                    onFinalize();
                  }}
                ></textarea>
             </section>

             <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center space-x-2">
                <Icons.Sparkles />
                <span>Re-Generate Object Isolation</span>
             </button>
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500 uppercase font-bold">Internal UUID</span>
            <span className="text-gray-400 font-mono">{layer.id.substring(0, 12)}...</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500 uppercase font-bold">Compute Load</span>
            <span className="text-green-400 font-mono">OPTIMAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectInspector;
