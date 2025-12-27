
import React, { useRef, useState, useEffect } from 'react';
import { Layer, Point, ToolType, Rect } from '../types';

interface CanvasEditorProps {
  layers: Layer[];
  selectedLayerId: string | null;
  zoom: number;
  canvasPosition: Point;
  activeTool: ToolType;
  onLayerSelect: (id: string | null) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onCanvasPositionUpdate: (pos: Point) => void;
  onFinalizeUpdate: () => void;
}

/**
 * The InteractionMode tracks exactly what the mouse is doing regardless of the active tool's name.
 */
type InteractionMode = 'NONE' | 'MOVE_LAYER' | 'PAN_CANVAS' | 'RESIZE' | 'ROTATE';

/**
 * CanvasEditor is the primary visual interaction surface.
 * It translates raw screen coordinates into workspace coordinates and 
 * handles state-driven rendering of layered assets.
 */
const CanvasEditor: React.FC<CanvasEditorProps> = ({
  layers,
  selectedLayerId,
  zoom,
  canvasPosition,
  activeTool,
  onLayerSelect,
  onLayerUpdate,
  onCanvasPositionUpdate,
  onFinalizeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction tracking state
  const [interaction, setInteraction] = useState<InteractionMode>('NONE');
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const dragStartScreen = useRef<Point>({ x: 0, y: 0 });
  const initialLayerState = useRef<Layer | null>(null);
  const initialCanvasState = useRef<Point>({ x: 0, y: 0 });
  
  // Visual tracking
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);

  /**
   * Converts a screen mouse event into normalized canvas coordinates (taking zoom/pan into account).
   */
  const getCanvasMousePos = (e: React.MouseEvent | MouseEvent): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - canvasPosition.x) / zoom,
      y: (e.clientY - rect.top - canvasPosition.y) / zoom,
    };
  };

  /**
   * Finds the topmost visible, unlocked layer under the given canvas coordinates.
   */
  const findLayerAt = (pos: Point): Layer | undefined => {
    return [...layers]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find(l => (
        l.isVisible &&
        !l.isLocked &&
        pos.x >= l.x && pos.x <= l.x + l.width &&
        pos.y >= l.y && pos.y <= l.y + l.height
      ));
  };

  /**
   * Initiates resizing from a specific corner handle.
   */
  const handleResizeStart = (e: React.MouseEvent, handle: string, layer: Layer) => {
    e.stopPropagation(); // Prevent layer selection/drag
    e.preventDefault();
    
    dragStartScreen.current = { x: e.clientX, y: e.clientY };
    initialLayerState.current = { ...layer };
    setResizeHandle(handle);
    setInteraction('RESIZE');
  };

  /**
   * Logic for initiating a drag or pan operation.
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle primary (left) and secondary (right) buttons
    if (e.button !== 0 && e.button !== 2) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartScreen.current = { x: e.clientX, y: e.clientY };

    // RIGHT CLICK or PAN TOOL: Initiate scene panning
    if (e.button === 2 || activeTool === ToolType.PAN) {
      setInteraction('PAN_CANVAS');
      initialCanvasState.current = { ...canvasPosition };
      return;
    }

    // LEFT CLICK: Determine if we should move a layer or pan the background
    const canvasPos = getCanvasMousePos(e);
    const hit = findLayerAt(canvasPos);

    if (hit) {
      onLayerSelect(hit.id);
      setInteraction('MOVE_LAYER');
      initialLayerState.current = { ...hit };
    } else {
      // If we clicked empty space in SELECT mode, fallback to panning for UX comfort
      onLayerSelect(null);
      if (activeTool === ToolType.SELECT || activeTool === ToolType.MOVE) {
        setInteraction('PAN_CANVAS');
        initialCanvasState.current = { ...canvasPosition };
      }
    }
  };

  /**
   * Logic for updating positions during an active mouse drag.
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = getCanvasMousePos(e);
    
    // Update hover state for visual feedback only when not dragging
    if (interaction === 'NONE') {
      const hoverHit = findLayerAt(canvasPos);
      setHoveredLayerId(hoverHit?.id || null);
      return;
    }

    // Calculate movement deltas in workspace units (scaled by zoom)
    const dx = (e.clientX - dragStartScreen.current.x) / zoom;
    const dy = (e.clientY - dragStartScreen.current.y) / zoom;

    if (interaction === 'PAN_CANVAS') {
      const globalDx = e.clientX - dragStartScreen.current.x;
      const globalDy = e.clientY - dragStartScreen.current.y;
      
      onCanvasPositionUpdate({
        x: initialCanvasState.current.x + globalDx,
        y: initialCanvasState.current.y + globalDy,
      });
    } else if (interaction === 'MOVE_LAYER' && initialLayerState.current) {
      onLayerUpdate(initialLayerState.current.id, {
        x: initialLayerState.current.x + dx,
        y: initialLayerState.current.y + dy,
      });
    } else if (interaction === 'RESIZE' && initialLayerState.current && resizeHandle) {
      const init = initialLayerState.current;
      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      // Calculate resize based on handle
      if (resizeHandle.includes('e')) newW = init.width + dx;
      if (resizeHandle.includes('w')) { newX = init.x + dx; newW = init.width - dx; }
      if (resizeHandle.includes('s')) newH = init.height + dy;
      if (resizeHandle.includes('n')) { newY = init.y + dy; newH = init.height - dy; }

      // Aspect ratio lock check (simplified)
      if (init.aspectRatioLocked) {
        // Complex aspect ratio logic omitted for brevity in this snippet, 
        // relying on free-form resize or basic constraint
      }

      // Prevent negative dimensions
      if (newW < 10) newW = 10;
      if (newH < 10) newH = 10;

      onLayerUpdate(init.id, {
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      });
    }
  };

  /**
   * Logic for ending an interaction and committing history.
   */
  const handleMouseUp = () => {
    if (interaction !== 'NONE') {
      onFinalizeUpdate();
    }
    setInteraction('NONE');
    setResizeHandle(null);
    initialLayerState.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 relative overflow-hidden checkerboard flex items-center justify-center select-none ${
        interaction === 'PAN_CANVAS' ? 'cursor-grabbing' : (activeTool === ToolType.PAN ? 'cursor-grab' : 'cursor-auto')
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Visual Background Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '50px 50px' }}></div>
      </div>

      {/* Main Content Layer Stack */}
      <div 
        className="relative pointer-events-none"
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${zoom})`,
          width: '0px',
          height: '0px',
        }}
      >
        {layers.filter(l => l.isVisible).map(layer => {
          const isSelected = selectedLayerId === layer.id;
          const isHovered = hoveredLayerId === layer.id;
          
          return (
            <div
              key={layer.id}
              className={`absolute select-none pointer-events-none ${isSelected ? 'z-50' : 'z-10'}`}
              style={{
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                opacity: layer.opacity,
                zIndex: layer.zIndex,
                transform: `rotate(${layer.rotation}deg)`,
                boxShadow: isSelected 
                  ? '0 0 0 2px #6366f1, 0 25px 60px rgba(0,0,0,0.6)' 
                  : (isHovered && !layer.isLocked ? '0 0 0 1px rgba(99,102,241,0.5)' : 'none'),
                transition: interaction === 'NONE' ? 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              }}
            >
              {layer.dataUrl && (
                <img 
                  src={layer.dataUrl} 
                  draggable={false}
                  className="w-full h-full object-fill pointer-events-none"
                  alt={layer.name} 
                />
              )}

              {/* Manipulation Overlays */}
              {isSelected && !layer.isLocked && (
                <div className="absolute inset-0 border-2 border-indigo-500/80 border-dashed animate-[pulse_3s_infinite] pointer-events-none">
                   {/* Name Label */}
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black tracking-widest shadow-2xl uppercase italic whitespace-nowrap">
                     {layer.name}
                   </div>

                   {/* Corner Handles (Active) */}
                   <div 
                    onMouseDown={(e) => handleResizeStart(e, 'nw', layer)}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nw-resize pointer-events-auto hover:scale-125 transition-transform"
                   ></div>
                   <div 
                    onMouseDown={(e) => handleResizeStart(e, 'ne', layer)}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-ne-resize pointer-events-auto hover:scale-125 transition-transform"
                   ></div>
                   <div 
                    onMouseDown={(e) => handleResizeStart(e, 'sw', layer)}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-sw-resize pointer-events-auto hover:scale-125 transition-transform"
                   ></div>
                   <div 
                    onMouseDown={(e) => handleResizeStart(e, 'se', layer)}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-se-resize pointer-events-auto hover:scale-125 transition-transform"
                   ></div>

                   {/* Dimensions Tooltip */}
                   <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-950/80 border border-gray-800 text-gray-400 text-[8px] px-2 py-1 rounded font-mono">
                     {Math.round(layer.width)} x {Math.round(layer.height)}
                   </div>
                </div>
              )}
              
              {/* Interaction Blockers */}
              {layer.isLocked && isHovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-950/20 backdrop-blur-[1px] pointer-events-none">
                  <div className="bg-amber-500 text-white p-1 rounded-full scale-75 opacity-80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mode Indicator Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="flex flex-col space-y-3">
          <div className="bg-gray-950/90 backdrop-blur-xl border border-gray-800 px-5 py-2.5 rounded-2xl flex items-center space-x-4 shadow-2xl pointer-events-auto hover:border-indigo-500/30 transition-colors">
            <div className={`w-2.5 h-2.5 rounded-full ${interaction !== 'NONE' ? 'bg-indigo-400 animate-pulse shadow-[0_0_12px_#6366f1]' : 'bg-gray-700'}`}></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-200 tracking-[0.2em] uppercase leading-none mb-1">
                {interaction !== 'NONE' ? `EXECUTING ${interaction}` : `${activeTool} ENGINE ACTIVE`}
              </span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                Renderer v2.5.0-Stable
              </span>
            </div>
          </div>
          
          {selectedLayerId && (
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/50 p-4 rounded-2xl flex flex-col space-y-2 animate-in slide-in-from-left-4 duration-300 pointer-events-auto">
               <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Selected Coordinates</span>
               <div className="flex items-center space-x-6 text-[10px] font-mono text-indigo-400 font-bold">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700">X:</span>
                    <span>{Math.round(layers.find(l => l.id === selectedLayerId)?.x || 0)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700">Y:</span>
                    <span>{Math.round(layers.find(l => l.id === selectedLayerId)?.y || 0)}</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Hotkeys / Info Legend */}
      <div className="absolute bottom-6 left-6 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] pointer-events-none select-none">
        <div className="flex flex-col space-y-1">
           <div className="flex items-center space-x-2">
             <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
             <span>Left Click + Drag: Manipulate Object</span>
           </div>
           <div className="flex items-center space-x-2">
             <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
             <span>Right Click + Drag: Pan Workspace</span>
           </div>
           <div className="flex items-center space-x-2">
             <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
             <span>Corner Handles: Resize Entity</span>
           </div>
        </div>
      </div>

      {/* Viewport Zoom Indicator */}
      <div className="absolute bottom-6 right-6 pointer-events-none">
        <div className="bg-gray-950/60 backdrop-blur-md border border-gray-800 px-4 py-2 rounded-xl text-[10px] font-mono text-gray-400 font-bold">
          MAGNIFICATION: {Math.round(zoom * 100)}%
        </div>
      </div>

      <style>{`
        .checkerboard {
          background-image: linear-gradient(45deg, #0f172a 25%, transparent 25%),
                            linear-gradient(-45deg, #0f172a 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #0f172a 75%),
                            linear-gradient(-45deg, transparent 75%, #0f172a 75%);
          background-size: 40px 40px;
          background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
          background-color: #020617;
        }
      `}</style>
    </div>
  );
};

export default CanvasEditor;
