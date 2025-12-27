
import { Point, Rect } from '../types';

/**
 * Transforms client coordinates to canvas space.
 */
export const clientToCanvas = (
  clientX: number,
  clientY: number,
  canvasPos: Point,
  zoom: number,
  containerRect: DOMRect
): Point => {
  return {
    x: (clientX - containerRect.left - canvasPos.x) / zoom,
    y: (clientY - containerRect.top - canvasPos.y) / zoom,
  };
};

/**
 * Checks if a point is within a rectangle.
 */
export const isPointInRect = (p: Point, r: Rect): boolean => {
  return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
};

/**
 * Calculates rotation matrix-aware coordinates.
 */
export const getRotatedPoint = (p: Point, center: Point, angle: number): Point => {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
};

/**
 * Utility to calculate the bounding box of a rotated rectangle.
 */
export const getRotationBoundingBox = (r: Rect, angle: number): Rect => {
  const center = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  const p1 = getRotatedPoint({ x: r.x, y: r.y }, center, angle);
  const p2 = getRotatedPoint({ x: r.x + r.width, y: r.y }, center, angle);
  const p3 = getRotatedPoint({ x: r.x + r.width, y: r.y + r.height }, center, angle);
  const p4 = getRotatedPoint({ x: r.x, y: r.y + r.height }, center, angle);
  
  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
