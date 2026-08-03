// Distance in px a pointer must travel before the gesture axis-locks. Below the
// slop the gesture stays undecided and the browser keeps control (scroll, click).
export const PAN_DEFAULT_THRESHOLD = 10;

// Width in px of the start zone when `edge` is set.
export const PAN_DEFAULT_EDGE_SIZE = 24;

// Duration in ms of the rolling sample window velocity is computed over. A short
// window makes a slow drag that ends in a fast flick report the flick's velocity
// rather than averaging it away over the whole gesture.
export const PAN_VELOCITY_WINDOW = 100;

// Minimum travel in px for a released pan to commit as a swipe.
export const SWIPE_DEFAULT_MIN_DISTANCE = 48;

// Minimum dominant-axis release velocity in px/ms for a released pan to commit
// as a swipe regardless of distance (a flick).
export const SWIPE_DEFAULT_MIN_VELOCITY = 0.4;
