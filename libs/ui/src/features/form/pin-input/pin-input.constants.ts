// Matches strings containing only numeric digits (0–9).
// Ensures the entire input consists exclusively of numbers.
export const PIN_INPUT_NUMERIC_REGEX = /^[0-9]+$/;

// Matches strings containing only alphanumeric characters (a–z, A–Z, 0–9).
// The `i` flag makes it case-insensitive (redundant here since both cases are
// explicitly listed, but harmless). Ensures no special characters are allowed.
export const PIN_INPUT_ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/i;
