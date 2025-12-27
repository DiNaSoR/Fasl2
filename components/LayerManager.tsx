
import React, { useState } from 'react';
import { Layer } from '../types';
import { Icons } from '../constants';

interface LayerManagerProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (id: string) => void;
  onLayerVisibilityToggle: (id: string) => void;
  onLayerLockToggle: (id: string) => void;
  onLayerRemove: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerRemove,
  onReorder,
}) => {
  // Sort layers by zIndex descending (top layers first in list)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLayerId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedLayerId && draggedLayerId !== targetId) {
      onReorder(draggedLayerId, targetId);
    }
    setDraggedLayerId(null);
  };

  return (
    <div className="w-72 bg-gray-950 border-l border-gray-800 flex flex-col h-full z-40 relative">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <div className="flex items-center space-x-2 text-gray-400">
          <Icons.Layers />
          <span className="font-bold uppercase text-[10px] tracking-widest">Layers</span>
        </div>
        <span className="text-gray-600 text-[10px] font-mono">{layers.length} total</span>
      </div>

      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {sortedLayers.map((layer) => (
          <div
            key={layer.id}
            draggable={!layer.isLocked}
            onDragStart={(e) => handleDragStart(e, layer.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, layer.id)}
            onClick={() => onLayerSelect(layer.id)}
            className={`group flex items-center space-x-3 p-2 rounded transition-all cursor-pointer border border-transparent
              ${selectedLayerId === layer.id ? 'bg-indigo-600/20 border-l-2 border-l-indigo-500' : 'hover:bg-gray-800/50'}
              ${draggedLayerId === layer.id ? 'opacity-50 dashed-border' : ''}
            `}
          >
            {/* Drag Handle Indicator */}
            <div className="w-1 h-8 rounded-full bg-gray-800 group-hover:bg-gray-700 cursor-grab flex flex-col justify-center space-y-0.5 px-0.5">
               <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
               <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
               <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>

            <div className="flex items-center space-x-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); onLayerVisibilityToggle(layer.id); }}
                className={`p-1 ${layer.isVisible ? 'text-indigo-400' : 'text-gray-700'}`}
              >
                {layer.isVisible ? <Icons.Eye /> : <Icons.EyeOff />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onLayerLockToggle(layer.id); }}
                className={`p-1 ${layer.isLocked ? 'text-amber-500' : 'text-gray-700'}`}
              >
                {layer.isLocked ? <Icons.Lock /> : <Icons.Unlock />}
              </button>
            </div>

            <div className="w-10 h-10 bg-gray-800 rounded border border-gray-700/50 overflow-hidden flex-shrink-0 relative">
               {/* Checkerboard for transparent layer preview */}
              <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                  backgroundSize: '8px 8px',
                  backgroundColor: '#333'
              }}></div>
              <img src={layer.dataUrl} className="relative w-full h-full object-contain z-10" alt="" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold truncate text-gray-200">{layer.name}</div>
              <div className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter">{layer.type}</div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onLayerRemove(layer.id); }}
              className="p-1 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
            >
              <Icons.Trash />
            </button>
          </div>
        ))}
      </div>

      {/* Floating AI Assistant Box */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-2xl pointer-events-auto">
           <div className="flex items-center justify-between mb-2">
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">AI Assistant</span>
             <div className="flex space-x-1">
               <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping"></div>
               <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
             </div>
           </div>
           <p className="text-[10px] text-gray-400 leading-relaxed italic">
             "Drag layers to reorder. Backgrounds are best placed at the bottom."
           </p>
        </div>
      </div>
    </div>
  );
};

export default LayerManager;
