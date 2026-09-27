// Names registered by this bundle. Registration is permanent for the life of a
// document and a second attempt throws, so each name is only ever tried once.
const registeredNames = new Set<string>();

/**
 * Registers a custom property with the document, typing it and deciding whether
 * it inherits.
 *
 * Idempotent and safe to call from every instance of whatever writes the
 * property: only the first call for a name registers it. A no-op where the CSS
 * Properties and Values API is unavailable (server rendering, older engines),
 * which leaves the property an ordinary inherited one.
 */
export function registerCustomProperty(definition: PropertyDefinition): void {
  if (registeredNames.has(definition.name)) return;
  registeredNames.add(definition.name);

  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') return;

  try {
    CSS.registerProperty(definition);
  } catch (error) {
    // Already registered — by another copy of this library, or by an
    // `@property` rule the page itself carries. Either way it now exists.
    if (error instanceof DOMException && error.name === 'InvalidModificationError') return;
    throw error;
  }
}
