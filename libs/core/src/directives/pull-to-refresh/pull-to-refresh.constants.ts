// How far in px the pull must reach before releasing it asks for a refresh.
// Short enough to be reachable with a thumb, long enough that a stray downward
// flick at the top of a list does not commit.
export const PULL_TO_REFRESH_DEFAULT_THRESHOLD = 64;

// Furthest in px the pull can travel, however far the finger goes. The travel
// stops well before the finger does, which is what makes the surface read as
// held rather than dragged loose.
export const PULL_TO_REFRESH_DEFAULT_MAX_DISTANCE = 96;

// Share of the finger's travel the pull follows before the cap takes over. Below
// 1 the surface lags the finger, which is the resistance that tells a reader
// they are pulling against something.
export const PULL_TO_REFRESH_RESISTANCE = 0.5;

// Shortest time in ms the surface is held open once a refresh is asked for. A
// refresh answered instantly — from a cache, or with nothing reporting on it —
// would otherwise come and go faster than it can be seen to have happened.
export const PULL_TO_REFRESH_DEFAULT_MIN_REFRESHING_TIME = 500;
