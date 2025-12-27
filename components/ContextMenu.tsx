
import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';

interface ContextMenuProps {
  x: number;
  y: number;
  isVisible: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, isVisible, onClose, onAction }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-[1000] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-1 w-48 animate-in fade-in zoom-in duration-100"
      style={{ left: x, top: y }}
      onMouseLeave={onClose}
    >
      <button 
        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-indigo-600 flex items-center space-x-3 transition-colors text-gray-200"
        onClick={() => { onAction('duplicate'); onClose(); }}
      >
        <Icons.Plus />
        <span>Duplicate Layer</span>
      </button>
      <button 
        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-indigo-600 flex items-center space-x-3 transition-colors text-gray-200"
        onClick={() => { onAction('lock'); onClose(); }}
      >
        <Icons.Lock />
        <span>Toggle Lock</span>
      </button>
      <button 
        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-indigo-600 flex items-center space-x-3 transition-colors text-gray-200"
        onClick={() => { onAction('hide'); onClose(); }}
      >
        <Icons.EyeOff />
        <span>Hide Layer</span>
      </button>
      <div className="h-px bg-gray-700 my-1 mx-2"></div>
      <button 
        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-red-600 flex items-center space-x-3 transition-colors text-red-400 hover:text-white"
        onClick={() => { onAction('delete'); onClose(); }}
      >
        <Icons.Trash />
        <span>Delete Permanent</span>
      </button>
    </div>
  );
};

export default ContextMenu;
