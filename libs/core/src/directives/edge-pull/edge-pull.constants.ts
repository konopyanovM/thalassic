// How far in px the pull must reach before releasing it commits. Long enough
// that scrolling on into the end of a container does not commit by momentum of
// the hand alone.
export const EDGE_PULL_DEFAULT_THRESHOLD = 72;

// Furthest in px the pull can travel, however far the finger goes. The travel
// stops well before the finger does, which is what makes the surface read as
// held rather than dragged loose.
export const EDGE_PULL_DEFAULT_MAX_DISTANCE = 112;

// How far in px past where the gesture began the finger has to go before a
// reversible pull changes ends. Wide enough that a thumb wavering around its
// starting point does not flicker between the two.
export const EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE = 12;

// Share of the finger's travel the pull follows before the cap takes over. Below
// 1 the surface lags the finger, which is the resistance that tells a reader
// they are pulling against something.
export const EDGE_PULL_RESISTANCE = 0.5;
