
import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import LayerManager from './components/LayerManager';
import ObjectInspector from './components/ObjectInspector';
import CanvasEditor from './components/CanvasEditor';
import AssetBrowser from './components/AssetBrowser';
import AssetGallery from './components/AssetGallery';
import ContextMenu from './components/ContextMenu';
import HistoryTimeline from './components/HistoryTimeline';
import { Icons } from './constants';
import { useEditor } from './hooks/useEditor';
import { ToolType } from './types';

/**
 * VisionLayer AI - The Ultimate Object-Oriented Workspace.
 * 
 * Architecture Overview:
 * - App: Root orchestrator managing high-level view state and global key listeners.
 * - useEditor: Custom hook for the 'Redux-style' editor state logic (Layers, Zoom, History).
 * - CanvasEditor: High-performance rendering layer for interactive media manipulation.
 * - LayerManager: Structural list of all entities with visibility/lock controls.
 * - ObjectInspector: Granular control panel for selected entity parameters.
 * - GeminiService: Neural integration layer for object segmentation and descriptions.
 */
const App: React.FC = () => {
  // Central Editor Engine Hook
  const {
    state,
    updateState,
    updateLayer,
    finalizeLayerUpdate,
    removeLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    undo,
    redo,
    processImage,
    replaceBackground,
    reorderLayers,
    updateCanvasPosition
  } = useEditor();

  // Component UI State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'LAYERS' | 'ASSETS' | 'CONFIG'>('LAYERS');
  const [contextMenu, setContextMenu] = useState<{ isVisible: boolean; x: number; y: number }>({
    isVisible: false,
    x: 0,
    y: 0,
  });

  /**
   * Global Keyboard Shortcut Management.
   * Ensures a professional productivity experience for power users.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keys when typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo/Redo
      if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // Tool Switching
      switch (e.key.toLowerCase()) {
        case 'v': updateState({ activeTool: ToolType.SELECT }); break;
        case 'm': updateState({ activeTool: ToolType.MOVE }); break;
        case 'h': updateState({ activeTool: ToolType.PAN }); break;
        case 'c': updateState({ activeTool: ToolType.CROP }); break;
        case 'e': updateState({ activeTool: ToolType.ERASER }); break;
      }

      // Layer Deletion
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedLayerId) removeLayer(state.selectedLayerId);
      }
      
      // Deselection
      if (e.key === 'Escape') {
        updateState({ selectedLayerId: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, removeLayer, state.selectedLayerId, updateState]);

  /**
   * Canvas Mouse Event Interceptors.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) replaceBackground(file);
  };

  const handleLayerSelect = useCallback((id: string | null) => {
    updateState({ selectedLayerId: id });
  }, [updateState]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ isVisible: true, x: e.clientX, y: e.clientY });
  };

  const handleContextAction = (action: string) => {
    if (!state.selectedLayerId) return;
    
    switch (action) {
      case 'lock': toggleLayerLock(state.selectedLayerId); break;
      case 'hide': toggleLayerVisibility(state.selectedLayerId); break;
      case 'delete': removeLayer(state.selectedLayerId); break;
      case 'duplicate': 
        // Logic for duplication would be implemented in useEditor
        break;
    }
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  const handleExport = () => {
    // Generate a ZIP or Multi-Layer JSON Export
    alert('VisionLayer Pipeline: Exporting layered asset bundle...');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950 text-gray-100 select-none antialiased">
      {/* Global Header & Nav */}
      <Toolbar 
        activeTool={state.activeTool}
        onToolSelect={(tool) => updateState({ activeTool: tool })}
        onUpload={handleFileUpload}
        onBackgroundUpload={handleBackgroundUpload}
        status={state.statusMessage}
        isLoading={state.isLoading}
        onUndo={undo}
        onRedo={redo}
        onExport={handleExport}
      />

      <div className="flex flex-1 overflow-hidden relative" onContextMenu={handleContextMenu}>
        {/* Productivity Navigation Sidebar */}
        <aside className="w-20 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-10 space-y-12 z-50">
          <button 
            onClick={() => setIsGalleryOpen(true)}
            className="p-4 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl text-white shadow-2xl shadow-indigo-900/60 hover:scale-110 active:scale-95 transition-all group relative"
            title="Entity Repository"
          >
            <Icons.Sparkles />
            <div className="absolute -right-2 -top-2 w-5 h-5 bg-pink-500 rounded-full text-[9px] flex items-center justify-center font-black border-2 border-gray-950">
              {state.layers.filter(l => l.type === 'object').length}
            </div>
          </button>
          
          <div className="flex flex-col space-y-8">
             <button 
               onClick={() => setActiveSidePanel('LAYERS')}
               className={`p-4 rounded-2xl transition-all ${activeSidePanel === 'LAYERS' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}
             >
               <Icons.Layers />
             </button>
             <button 
               onClick={() => setActiveSidePanel('CONFIG')}
               className={`p-4 rounded-2xl transition-all ${activeSidePanel === 'CONFIG' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}
             >
               <Icons.Settings />
             </button>
             <button className="p-4 text-gray-500 hover:text-white transition-colors"><Icons.Info /></button>
          </div>
          
          <div className="mt-auto pb-6">
             <div className="w-1.5 h-16 bg-gray-900 rounded-full overflow-hidden relative">
                <div className="absolute top-0 w-full h-1/2 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
             </div>
          </div>
        </aside>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 flex flex-col relative bg-[#020617] overflow-hidden">
          {/* Main Rendering Engine */}
          <CanvasEditor 
            layers={state.layers}
            selectedLayerId={state.selectedLayerId}
            zoom={state.zoom}
            canvasPosition={state.canvasPosition}
            activeTool={state.activeTool}
            onLayerSelect={handleLayerSelect}
            onLayerUpdate={updateLayer}
            onCanvasPositionUpdate={updateCanvasPosition}
            onFinalizeUpdate={finalizeLayerUpdate}
          />
          
          {/* Floating Asset Quick-Access */}
          <AssetBrowser 
            layers={state.layers} 
            onLayerSelect={handleLayerSelect} 
          />

          {/* Persistent Footer Data Stream */}
          <footer className="h-14 bg-gray-950/95 backdrop-blur-3xl border-t border-gray-800 flex items-center justify-between px-10 text-[10px] font-mono text-gray-600 z-50">
             <div className="flex items-center space-x-16">
               <div className="flex items-center space-x-4">
                  <span className="text-gray-800 font-black tracking-[0.2em]">COORD_XY</span>
                  <span className="text-indigo-500 font-bold bg-indigo-500/5 px-2 py-1 rounded">
                    {Math.round(state.canvasPosition.x).toString().padStart(4, '0')} : {Math.round(state.canvasPosition.y).toString().padStart(4, '0')}
                  </span>
               </div>
               <div className="flex items-center space-x-4">
                  <span className="text-gray-800 font-black tracking-[0.2em]">ENTITIES</span>
                  <span className="text-indigo-400 font-bold">{state.layers.length.toString().padStart(2, '0')}</span>
               </div>
               <div className="flex items-center space-x-4">
                  <span className="text-gray-800 font-black tracking-[0.2em]">MAGNIFY</span>
                  <span className="text-indigo-400 font-bold">{Math.round(state.zoom * 100)}%</span>
               </div>
             </div>
             <div className="flex items-center space-x-6">
                <div className="flex flex-col items-end">
                  <span className="text-indigo-500/40 tracking-[0.6em] font-black italic uppercase leading-none">Vision_Matrix_OS</span>
                  <span className="text-[7px] text-gray-800 font-black tracking-[0.4em] uppercase mt-1 leading-none">Segmenting Neural Network Ver 2.5-Stable</span>
                </div>
                <div className="flex space-x-1.5 h-6 items-center">
                   {[1,2,3,4,5,6,7].map(i => <div key={i} className={`w-1 h-full rounded-full transition-all duration-500 ${i <= 5 ? 'bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-gray-900'}`}></div>)}
                </div>
             </div>
          </footer>
        </main>

        {/* Functional Side Panel (Layers & Inspector) */}
        <div className="flex h-full border-l border-gray-800 bg-gray-950/80 backdrop-blur-2xl">
          <LayerManager 
            layers={state.layers}
            selectedLayerId={state.selectedLayerId}
            onLayerSelect={handleLayerSelect}
            onLayerVisibilityToggle={toggleLayerVisibility}
            onLayerLockToggle={toggleLayerLock}
            onLayerRemove={removeLayer}
            onReorder={reorderLayers}
          />
          <ObjectInspector 
            layer={state.layers.find(l => l.id === state.selectedLayerId) || null}
            onUpdate={updateLayer}
            onFinalize={finalizeLayerUpdate}
          />
        </div>
      </div>

      {/* Overlays & Modals */}
      <AssetGallery 
        isOpen={isGalleryOpen} 
        layers={state.layers} 
        onClose={() => setIsGalleryOpen(false)} 
      />
      
      <ContextMenu 
        isVisible={contextMenu.isVisible} 
        x={contextMenu.x} 
        y={contextMenu.y} 
        onClose={() => setContextMenu(p => ({...p, isVisible: false}))} 
        onAction={handleContextAction} 
      />

      {/* Global Neural Processing Screen */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-[#020617]/98 z-[1000] flex flex-col items-center justify-center animate-in fade-in duration-700">
          <div className="relative mb-20">
             {/* Dynamic Ring Animations */}
             <div className="w-48 h-48 border-4 border-gray-900 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-[spin_1.2s_cubic-bezier(0.4,0,0.2,1)_infinite]"></div>
             <div className="absolute inset-4 border-2 border-purple-500/30 rounded-full border-b-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
             
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.5)] animate-pulse flex items-center justify-center">
                   <Icons.Sparkles />
                </div>
             </div>
          </div>
          
          <div className="text-center space-y-6 max-w-xl px-12">
             <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-2 leading-none">
                Reconstructing <br/><span className="text-indigo-500">Visual Context</span>
             </h2>
             <div className="flex flex-col items-center space-y-4">
                <p className="text-indigo-400 font-mono text-xs uppercase tracking-[0.8em] animate-pulse">
                  {state.statusMessage}
                </p>
                <div className="w-96 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                   <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-[200%] animate-[loading-bar_3s_infinite_linear]"></div>
                </div>
                <div className="flex space-x-12 text-[9px] font-black text-gray-700 uppercase tracking-widest pt-4">
                   <span className="text-indigo-300">De-Buffering</span>
                   <span>Segmenting</span>
                   <span>Isolating</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Detailed Documentation / Welcome Overlay for empty states */}
      {!state.isLoading && state.layers.length === 0 && (
        <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-[5]">
           <div className="p-12 bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-[3rem] text-center max-w-2xl space-y-10 border-dashed opacity-60">
              <div className="w-24 h-24 bg-gray-950 rounded-[2rem] mx-auto flex items-center justify-center text-gray-700">
                 <Icons.Upload />
              </div>
              <div className="space-y-4">
                 <h1 className="text-3xl font-black uppercase tracking-tight text-gray-600">Workspace Awaiting Buffer</h1>
                 <p className="text-gray-500 font-medium leading-relaxed">
                    Upload a high-resolution image to initiate the neural segmentation workflow. <br/>
                    VisionLayer will automatically identify and isolate distinct entities as manipulatable sub-layers.
                 </p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                 <div className="space-y-2">
                    <div className="mx-auto w-1 h-6 bg-gray-800 rounded-full"></div>
                    <span>Drag & Drop</span>
                 </div>
                 <div className="space-y-2">
                    <div className="mx-auto w-1 h-6 bg-gray-800 rounded-full"></div>
                    <span>Auto-Masking</span>
                 </div>
                 <div className="space-y-2">
                    <div className="mx-auto w-1 h-6 bg-gray-800 rounded-full"></div>
                    <span>Pro Export</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Global CSS Inject */}
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .checkerboard {
          background-image: linear-gradient(45deg, #020617 25%, transparent 25%),
                            linear-gradient(-45deg, #020617 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #020617 75%),
                            linear-gradient(-45deg, transparent 75%, #020617 75%);
          background-size: 30px 30px;
          background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
          background-color: #01040f;
        }

        ::selection {
          background: rgba(99, 102, 241, 0.4);
          color: white;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
          border: 2px solid #020617;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }

        input[type=range] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: #1e293b;
          border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #6366f1;
          margin-top: -5px;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  );
};

export default App;
