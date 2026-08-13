/**
 * Where a pull currently stands.
 *
 * - `idle`: nothing is being pulled.
 * - `pulling`: a pull is under way but has not reached the threshold, so
 *   releasing it asks for nothing.
 * - `armed`: the pull has passed the threshold; releasing it asks for a refresh.
 * - `refreshing`: a refresh asked for here is still running.
 */
export type pullToRefreshState = 'idle' | 'pulling' | 'armed' | 'refreshing';
