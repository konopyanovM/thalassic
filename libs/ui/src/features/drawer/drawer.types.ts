export type drawerSide = 'start' | 'end' | 'top' | 'bottom';

export type drawerSize = 'sm' | 'md' | 'lg' | 'full' | 'auto';

/**
 * Where the panel's transform comes from. `idle` leaves it to the enter/leave
 * keyframes; `dragging` hands it to the finger; `settling` animates it to a
 * resting position or off-screen.
 */
export type drawerDragState = 'idle' | 'dragging' | 'settling';

/**
 * Whether the panel shows a grabber. `auto` shows one on a bottom sheet, where a
 * grabber is the expected affordance for dragging it away, and nowhere else.
 */
export type drawerGrabber = boolean | 'auto';

/**
 * Where a drawer opened by a drag stands: waiting to be laid out (`pending`),
 * under the finger (`following`), on its way after release (`settling`), or
 * finished opening — which a drawer opened any other way always is (`done`).
 */
export type drawerOpenPhase = 'pending' | 'following' | 'settling' | 'done';

/** How a drawer is being opened, fixed for its lifetime. */
export interface DrawerOpening {
  /** The element it slides out of and back into; null for the plain slide. */
  origin: HTMLElement | null;
  /** Whether it opens under a drag fed through its `DrawerRef`, rather than by itself. */
  byDrag: boolean;
}

/** A panel's displacement from its resting place, in px along each axis. */
export interface DrawerOffset {
  x: number;
  y: number;
}

/** Duration (ms) and easing of one direction of the slide, from the theme's motion tokens. */
export interface DrawerSlideTiming {
  duration: number;
  easing: string;
}

/**
 * An element carried between its place in a drawer and its partner's in the
 * drawer's origin: the translation (px) and scale that lay it over the partner
 * while the panel stands displaced. Scaled from its top-left corner.
 */
export interface DrawerSharedPair {
  element: HTMLElement;
  x: number;
  y: number;
  scale: number;
}
