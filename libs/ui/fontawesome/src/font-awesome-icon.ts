/**
 * Structural shape of a FontAwesome `IconDefinition`, matched by its `icon`
 * tuple `[width, height, ligatures, unicode, pathData]`.
 */
export type fontAwesomeIcon = {
  icon: [number, number, unknown, unknown, string | string[]];
};
