/**
 * Which end of the container is being pulled away from: `start` is its top,
 * reached by dragging down, and `end` its bottom, reached by dragging up.
 */
export type edgePullEdge = 'start' | 'end';

/**
 * Where a pull currently stands.
 *
 * - `idle`: nothing is being pulled.
 * - `pulling`: a pull is under way but has not reached the threshold, so
 *   releasing it asks for nothing.
 * - `armed`: the pull has passed the threshold; releasing it commits.
 */
export type edgePullState = 'idle' | 'pulling' | 'armed';
