
import React from 'react';
import { Layer } from '../types';
import { Icons } from '../constants';

interface AssetBrowserProps {
  layers: Layer[];
  onLayerSelect: (id: string) => void;
}

const AssetBrowser: React.FC<AssetBrowserProps> = ({ layers, onLayerSelect }) => {
  const assets = layers.filter(l => l.type === 'object');

  if (assets.length === 0) return null;

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[60%] bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:bg-gray-900/60 shadow-2xl pointer-events-auto">
      <div className="flex items-center space-x-2 mb-3 self-start px-2">
        <Icons.Sparkles />
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Isolated Entities</span>
      </div>
      <div className="flex space-x-3 overflow-x-auto pb-2 w-full snap-x">
        {assets.map(asset => (
          <div
            key={asset.id}
            onClick={() => onLayerSelect(asset.id)}
            className="flex-shrink-0 w-24 h-24 bg-gray-800 rounded-xl border border-gray-700 hover:border-indigo-500 hover:bg-gray-700/50 cursor-pointer overflow-hidden p-2 transition-all snap-start group relative"
          >
            <img src={asset.dataUrl} className="w-full h-full object-contain" alt={asset.name} />
            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-gray-950/80 p-1 text-[8px] truncate font-bold uppercase text-center text-gray-400">
              {asset.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetBrowser;
