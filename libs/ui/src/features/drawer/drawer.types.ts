export type drawerSide = 'start' | 'end' | 'top' | 'bottom';

export type drawerSize = 'sm' | 'md' | 'lg' | 'full' | 'auto';

/**
 * Where the panel's transform comes from. `idle` leaves it to the enter/leave
 * keyframes; `dragging` hands it to the finger; `settling` animates it to a
 * resting position or off-screen.
 */
export type drawerDragState = 'idle' | 'dragging' | 'settling';
