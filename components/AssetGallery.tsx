
import React from 'react';
import { Layer } from '../types';
import { Icons } from '../constants';

interface AssetGalleryProps {
  isOpen: boolean;
  layers: Layer[];
  onClose: () => void;
}

const AssetGallery: React.FC<AssetGalleryProps> = ({ isOpen, layers, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-gray-950/95 backdrop-blur-2xl p-12 overflow-y-auto animate-in fade-in zoom-in duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Asset Repository</h2>
            <p className="text-indigo-400 font-mono text-sm tracking-widest">VISION_CORE :: GENERATED_ENTITIES_V1</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center transition-all group"
          >
            <div className="group-hover:rotate-90 transition-transform">
               <Icons.X />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {layers.filter(l => l.type === 'object').map(layer => (
            <div key={layer.id} className="group relative aspect-square bg-gray-900 rounded-3xl border border-gray-800 p-8 flex flex-col items-center justify-center transition-all hover:border-indigo-500/50 hover:bg-gray-800/50">
               <div className="relative w-full h-full">
                  <img src={layer.dataUrl} className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" alt={layer.name} />
               </div>
               <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
               <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{layer.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{Math.round(layer.width)} × {Math.round(layer.height)} px</div>
               </div>
               
               <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-gray-950/80 rounded-lg text-indigo-400 hover:text-white border border-gray-800"><Icons.Sparkles /></button>
                  <button className="p-2 bg-gray-950/80 rounded-lg text-gray-400 hover:text-white border border-gray-800"><Icons.Download /></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetGallery;
