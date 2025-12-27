
/**
 * Core Type System for VisionLayer AI.
 * This file defines the strictly-typed structures for state management, 
 * geometry, and AI integration.
 */

/**
 * Available tools in the editor's workspace.
 */
export enum ToolType {
  /** Default selection and manipulation tool */
  SELECT = 'SELECT',
  /** Dedicated movement tool for objects */
  MOVE = 'MOVE',
  /** Viewport navigation / panning tool */
  PAN = 'PAN',
  /** Region-based cropping tool */
  CROP = 'CROP',
  /** Direct pixel manipulation / erasure tool */
  ERASER = 'ERASER',
}

/**
 * Represents a coordinate point in 2D space.
 */
export interface Point {
  /** The horizontal coordinate */
  x: number;
  /** The vertical coordinate */
  y: number;
}

/**
 * Represents a rectangular region in 2D space.
 */
export interface Rect {
  /** Left coordinate */
  x: number;
  /** Top coordinate */
  y: number;
  /** Dimension along X axis */
  width: number;
  /** Dimension along Y axis */
  height: number;
}

/**
 * Metadata returned by the Gemini Vision model during object segmentation.
 */
export interface GeminiObjectDetection {
  /** Identified name of the object */
  name: string;
  /** Confidence score (0 to 1) */
  confidence: number;
  /** Semantic description of the object's role or appearance */
  description: string;
  /** Bounding box in normalized coordinates (0-1000) */
  boundingBox: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

/**
 * A single layer within the editor's stack.
 */
export interface Layer {
  /** Unique persistent identifier */
  id: string;
  /** User-friendly name or AI-detected label */
  name: string;
  /** Semantic type of the layer content */
  type: 'image' | 'shape' | 'text' | 'object';
  /** Visibility toggle state */
  isVisible: boolean;
  /** Interaction lock state */
  isLocked: boolean;
  /** Transparency value (0.0 to 1.0) */
  opacity: number;
  /** Horizontal position relative to canvas origin */
  x: number;
  /** Vertical position relative to canvas origin */
  y: number;
  /** Display width in pixels */
  width: number;
  /** Display height in pixels */
  height: number;
  /** Clockwise rotation in degrees */
  rotation: number;
  /** Vertical stacking order */
  zIndex: number;
  /** Source data URI (typically PNG/Base64) */
  dataUrl?: string; 
  /** Snapshot of the original detection rectangle */
  originalRect?: Rect; 
  /** Detailed description used for AI context */
  description?: string;
  /** Categorization tags */
  tags?: string[];
  /** Flag to maintain width/height ratio during transformations */
  aspectRatioLocked?: boolean;
}

/**
 * The global state of the application's editor engine.
 */
export interface EditorState {
  /** Collection of all layers in the current project */
  layers: Layer[];
  /** ID of the currently active layer */
  selectedLayerId: string | null;
  /** Viewport scaling factor */
  zoom: number;
  /** Global pan offset of the canvas surface */
  canvasPosition: Point;
  /** The currently selected tool from ToolType */
  activeTool: ToolType;
  /** Global loading overlay toggle */
  isLoading: boolean;
  /** Background processing indicator */
  isProcessing: boolean;
  /** Message displayed in the status bar */
  statusMessage: string;
}

/**
 * Standardized action structure for internal state transitions.
 */
export interface AppAction {
  /** Semantic action identifier */
  type: string;
  /** Optional data payload associated with the action */
  payload?: any;
}
