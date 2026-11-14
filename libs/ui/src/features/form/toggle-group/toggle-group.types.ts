/**
 * How a toggle group draws its options. `filled` and `tonal` join them into one
 * strip and fill the chosen ones with the group's color, solid or as a wash.
 * `segmented` sets them apart on a track and lifts the chosen one off it as a
 * pill, the look of a segmented tab strip; it reads none of the group's color.
 */
export type toggleGroupVariant = 'filled' | 'tonal' | 'segmented';
