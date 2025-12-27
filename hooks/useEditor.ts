
import { useState, useCallback, useRef } from 'react';
import { Layer, EditorState, ToolType, Point } from '../types';
import { detectObjectsInImage } from '../services/geminiService';

/**
 * useEditor provides the business logic for the VisionLayer environment.
 * It manages state transitions, history, and AI pipeline execution.
 */

const INITIAL_STATE: EditorState = {
  layers: [],
  selectedLayerId: null,
  zoom: 1.0,
  canvasPosition: { x: 0, y: 0 },
  activeTool: ToolType.SELECT,
  isLoading: false,
  isProcessing: false,
  statusMessage: "System Ready. Please upload a source image.",
};

export const useEditor = () => {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);
  const [history, setHistory] = useState<Layer[][]>([]);
  const historyIndex = useRef<number>(-1);

  /**
   * Records a snapshot of current layers for undo functionality.
   */
  const pushHistory = useCallback((layers: Layer[]) => {
    const serializedLayers = JSON.parse(JSON.stringify(layers));
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex.current + 1);
      const updated = [...truncated, serializedLayers];
      if (updated.length > 50) updated.shift();
      historyIndex.current = updated.length - 1;
      return updated;
    });
  }, []);

  /**
   * Internal helper to update state with partial objects.
   */
  const updateState = useCallback((updates: Partial<EditorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Updates properties of a single layer by ID.
   */
  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setState(prev => {
      const newLayers = prev.layers.map(layer => 
        layer.id === id ? { ...layer, ...updates } : layer
      );
      return { ...prev, layers: newLayers };
    });
  }, []);

  /**
   * Commit a change to history (called after dragging stops).
   */
  const finalizeLayerUpdate = useCallback(() => {
    setState(prev => {
      pushHistory(prev.layers);
      return prev;
    });
  }, [pushHistory]);

  /**
   * Deletes a layer and updates the selection.
   */
  const removeLayer = useCallback((id: string) => {
    setState(prev => {
      const newLayers = prev.layers.filter(layer => layer.id !== id);
      pushHistory(newLayers);
      const newSelected = prev.selectedLayerId === id ? null : prev.selectedLayerId;
      return { ...prev, layers: newLayers, selectedLayerId: newSelected };
    });
  }, [pushHistory]);

  /**
   * Reorders layers based on drag and drop in the layer manager.
   * Updates Z-Index to reflect the new order.
   */
  const reorderLayers = useCallback((draggedId: string, targetId: string) => {
    setState(prev => {
      const layersCopy = [...prev.layers];
      const dragIndex = layersCopy.findIndex(l => l.id === draggedId);
      const targetIndex = layersCopy.findIndex(l => l.id === targetId);

      if (dragIndex === -1 || targetIndex === -1) return prev;

      // Move element in array
      const [removed] = layersCopy.splice(dragIndex, 1);
      layersCopy.splice(targetIndex, 0, removed);

      // Re-assign z-indexes based on new array order (bottom to top)
      // We reverse the array for z-index because visual list is often Top-to-Bottom
      const total = layersCopy.length;
      const reindexedLayers = layersCopy.map((layer, index) => ({
        ...layer,
        zIndex: total - index
      }));

      pushHistory(reindexedLayers);
      return { ...prev, layers: reindexedLayers };
    });
  }, [pushHistory]);

  /**
   * Toggles whether a layer is rendered on the canvas.
   */
  const toggleLayerVisibility = useCallback((id: string) => {
    setState(prev => {
      const newLayers = prev.layers.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l);
      pushHistory(newLayers);
      return { ...prev, layers: newLayers };
    });
  }, [pushHistory]);

  /**
   * Toggles the lock state which prevents dragging.
   */
  const toggleLayerLock = useCallback((id: string) => {
    setState(prev => {
      const newLayers = prev.layers.map(l => l.id === id ? { ...l, isLocked: !l.isLocked } : l);
      pushHistory(newLayers);
      return { ...prev, layers: newLayers };
    });
  }, [pushHistory]);

  /**
   * Standard undo implementation.
   */
  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      const targetState = history[historyIndex.current];
      setState(prev => ({ ...prev, layers: JSON.parse(JSON.stringify(targetState)) }));
    }
  }, [history]);

  /**
   * Standard redo implementation.
   */
  const redo = useCallback(() => {
    if (historyIndex.current < history.length - 1) {
      historyIndex.current += 1;
      const targetState = history[historyIndex.current];
      setState(prev => ({ ...prev, layers: JSON.parse(JSON.stringify(targetState)) }));
    }
  }, [history]);

  /**
   * Replaces the background layer while keeping object layers intact.
   */
  const replaceBackground = async (file: File) => {
    updateState({ isLoading: true, statusMessage: 'Compositing New Background...' });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      
      img.onload = () => {
        setState(prev => {
          // Remove existing background layers or layers tagged as context
          const objectLayers = prev.layers.filter(l => l.type === 'object');
          
          const newBgLayer: Layer = {
            id: `layer-bg-${Date.now()}`,
            name: 'New Background',
            type: 'image',
            isVisible: true,
            isLocked: true,
            opacity: 1,
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            rotation: 0,
            zIndex: 0, // Ensure it's at the bottom
            dataUrl: dataUrl,
            description: "Imported background context",
          };

          // Re-stack: Background at 0, objects above.
          const finalLayers = [newBgLayer, ...objectLayers.map((l, i) => ({
            ...l,
            zIndex: i + 1
          }))];

          pushHistory(finalLayers);
          return {
            ...prev,
            layers: finalLayers,
            isLoading: false,
            statusMessage: 'Background updated. Adjust object placement as needed.',
            // Reset view to fit new background
            zoom: Math.min(0.8, (window.innerHeight - 250) / img.height),
            canvasPosition: { x: 0, y: 0 }
          };
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  /**
   * High-level workflow for processing a user-uploaded image.
   * Steps: Load -> Display Base -> Query Gemini -> Extract Sub-images -> Add Layers.
   */
  const processImage = async (file: File) => {
    updateState({ isLoading: true, statusMessage: 'Initiating Vision Pipeline...' });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type;

      const img = new Image();
      img.onload = async () => {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Clear existing workspace
        setState(prev => ({ ...prev, layers: [], selectedLayerId: null }));

        // Background Layer
        const baseLayer: Layer = {
          id: `layer-bg-${Date.now()}`,
          name: 'Original Context',
          type: 'image',
          isVisible: true,
          isLocked: true,
          opacity: 1,
          x: 0,
          y: 0,
          width: originalWidth,
          height: originalHeight,
          rotation: 0,
          zIndex: 0,
          dataUrl: dataUrl,
          description: "Full scene reference",
        };

        updateState({ statusMessage: 'Gemini AI Segmenting Entities...' });
        
        try {
          const detectedObjects = await detectObjectsInImage(base64, mimeType);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          const newLayers: Layer[] = [baseLayer];
          for (const obj of detectedObjects) {
            const { ymin, xmin, ymax, xmax } = obj.boundingBox;
            const pxX = (xmin / 1000) * originalWidth;
            const pxY = (ymin / 1000) * originalHeight;
            const pxW = ((xmax - xmin) / 1000) * originalWidth;
            const pxH = ((ymax - ymin) / 1000) * originalHeight;

            // Extract pixel buffer for the specific object
            canvas.width = pxW;
            canvas.height = pxH;
            
            if (ctx) {
              ctx.clearRect(0, 0, pxW, pxH);
              ctx.drawImage(img, pxX, pxY, pxW, pxH, 0, 0, pxW, pxH);
              
              const objectLayer: Layer = {
                id: `obj-${Math.random().toString(36).substring(2, 11)}`,
                name: obj.name,
                type: 'object',
                isVisible: true,
                isLocked: false,
                opacity: 1,
                x: pxX,
                y: pxY,
                width: pxW,
                height: pxH,
                rotation: 0,
                zIndex: newLayers.length,
                dataUrl: canvas.toDataURL('image/png'),
                description: obj.description,
                tags: [obj.name.toLowerCase().replace(/\s+/g, '-')],
              };
              newLayers.push(objectLayer);
            }
          }

          setState(prev => {
            const finalLayers = newLayers.sort((a, b) => a.zIndex - b.zIndex);
            pushHistory(finalLayers);
            return { 
              ...prev, 
              layers: finalLayers, 
              isLoading: false, 
              statusMessage: `Analyzed ${newLayers.length - 1} semantic layers.`,
              zoom: Math.min(0.8, (window.innerHeight - 250) / originalHeight),
              canvasPosition: { x: 0, y: 0 }
            };
          });

        } catch (error) {
          console.error("Workflow Exception:", error);
          updateState({ isLoading: false, statusMessage: 'Critical AI Failure. Resetting environment.' });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  /**
   * Resets viewport transformations.
   */
  const centerView = useCallback(() => {
    updateState({ canvasPosition: { x: 0, y: 0 }, zoom: 1 });
  }, [updateState]);

  /**
   * Updates global viewport position.
   */
  const updateCanvasPosition = useCallback((pos: Point) => {
    updateState({ canvasPosition: pos });
  }, [updateState]);

  return {
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
    centerView,
    updateCanvasPosition,
    history,
    historyIndex: historyIndex.current,
  };
};
