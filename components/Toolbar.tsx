
import React from 'react';
import { Icons } from '../constants';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  status: string;
  isLoading: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}

/**
 * Main application navigation and tool selection component.
 */
const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  onToolSelect, 
  onUpload, 
  onBackgroundUpload,
  status, 
  isLoading,
  onUndo,
  onRedo,
  onExport
}) => {
  return (
    <div className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-8 z-50 relative shadow-2xl">
      {/* Brand & Tool Selection */}
      <div className="flex items-center space-x-10">
        <div className="flex items-center space-x-4 mr-6 group cursor-default">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-900/40 group-hover:rotate-12 transition-transform">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter uppercase leading-none">VisionLayer</span>
            <span className="text-indigo-500 font-mono text-[9px] font-bold tracking-[0.4em] uppercase leading-none mt-1">AI Workflow</span>
          </div>
        </div>

        {/* Primary Toolset */}
        <div className="flex items-center bg-gray-900/50 rounded-2xl p-1.5 border border-gray-800/80">
          <button 
            onClick={() => onToolSelect(ToolType.SELECT)}
            className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${activeTool === ToolType.SELECT ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            title="Object Select (V)"
          >
            <Icons.MousePointer />
            <span className={`text-[10px] font-bold uppercase tracking-widest overflow-hidden transition-all ${activeTool === ToolType.SELECT ? 'max-w-xs ml-1' : 'max-w-0'}`}>Select</span>
          </button>
          <button 
            onClick={() => onToolSelect(ToolType.MOVE)}
            className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${activeTool === ToolType.MOVE ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            title="Direct Move (M)"
          >
            <Icons.Move />
            <span className={`text-[10px] font-bold uppercase tracking-widest overflow-hidden transition-all ${activeTool === ToolType.MOVE ? 'max-w-xs ml-1' : 'max-w-0'}`}>Move</span>
          </button>
          <button 
            onClick={() => onToolSelect(ToolType.PAN)}
            className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${activeTool === ToolType.PAN ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            title="Pan Workspace (H)"
          >
            <Icons.Maximize />
            <span className={`text-[10px] font-bold uppercase tracking-widest overflow-hidden transition-all ${activeTool === ToolType.PAN ? 'max-w-xs ml-1' : 'max-w-0'}`}>Pan</span>
          </button>
        </div>

        {/* History Controls */}
        <div className="flex items-center space-x-1.5 ml-4">
          <button onClick={onUndo} className="p-2.5 text-gray-500 hover:text-indigo-400 hover:bg-gray-900/80 rounded-xl transition-all group" title="Undo (Cmd+Z)">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-active:-rotate-45 transition-transform"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          </button>
          <button onClick={onRedo} className="p-2.5 text-gray-500 hover:text-indigo-400 hover:bg-gray-900/80 rounded-xl transition-all group" title="Redo (Cmd+Shift+Z)">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-active:rotate-45 transition-transform"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
        </div>
      </div>

      {/* Global Status Bar */}
      <div className="hidden 2xl:flex items-center space-x-4 bg-gray-900/40 px-6 py-2 rounded-2xl border border-gray-800/50">
        <div className="flex items-center space-x-2">
           <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-indigo-500 animate-ping' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}></div>
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status:</span>
        </div>
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tighter truncate max-w-md italic">
          {status}
        </span>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center space-x-4">
        {/* Background Replacement */}
        <label className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-2xl cursor-pointer transition-all border border-gray-700 group active:scale-95" title="Replace Background Layer">
          <div className="w-4 h-4 rounded border border-gray-500 group-hover:bg-gray-500 transition-colors"></div>
          <span className="font-bold text-xs uppercase tracking-widest">Set BG</span>
          <input type="file" className="hidden" accept="image/*" onChange={onBackgroundUpload} />
        </label>

        <label className="flex items-center space-x-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl cursor-pointer transition-all shadow-xl shadow-indigo-900/40 group overflow-hidden relative active:scale-95">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Icons.Upload />
          <span className="font-black text-xs uppercase tracking-widest">New Project</span>
          <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
        </label>
        
        <button 
          onClick={onExport}
          className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-2xl border border-gray-700 transition-all hover:border-indigo-500/30 group active:scale-95"
          title="Export Project"
        >
          <Icons.Download />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
