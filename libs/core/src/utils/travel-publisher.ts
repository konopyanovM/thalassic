import { Renderer2, RendererStyleFlags2 } from '@angular/core';

/**
 * Publishes a gesture's travel, in px, as a custom property on the element the
 * gesture belongs to and on every other element that asks to carry it.
 *
 * Each element is written to directly, so the property can be registered as
 * non-inheriting and a write restyles only the elements that read it. Handing
 * the value down with `inherit` instead is not an option: WebKit does not
 * re-resolve a child's explicit `inherit` of a registered non-inheriting
 * property when the parent's value changes, so the child keeps a stale travel
 * until something else restyles it.
 */
export class TravelPublisher {
  // Elements carrying the travel besides the host.
  private readonly _followers = new Set<HTMLElement>();
  // Travel last written, for skipping no-op writes; `null` until the first
  // write.
  private _distance: number | null = null;

  constructor(
    private readonly _renderer: Renderer2,
    private readonly _host: HTMLElement,
    private readonly _propertyName: string,
  ) {}

  // Public methods
  /** Writes the travel to the host and to every follower. */
  public write(distance: number): void {
    // A gesture held at its cap resolves to the same travel on every following
    // move; re-writing it would invalidate style once per frame for nothing.
    if (distance === this._distance) return;
    this._distance = distance;

    this._writeTo(this._host, distance);
    for (const follower of this._followers) this._writeTo(follower, distance);
  }

  /**
   * Starts writing the travel to `element` as well. It is brought up to the
   * travel already published, so an element that appears mid-gesture does not
   * sit at rest until the next move.
   */
  public add(element: HTMLElement): void {
    this._followers.add(element);
    if (this._distance !== null) this._writeTo(element, this._distance);
  }

  /** Stops writing the travel to `element`. */
  public remove(element: HTMLElement): void {
    this._followers.delete(element);
  }

  // Private methods
  private _writeTo(element: HTMLElement, distance: number): void {
    this._renderer.setStyle(
      element,
      this._propertyName,
      `${distance}px`,
      // A custom property only lands when it is set as one; without the flag the
      // renderer treats the name as a camelCase style property.
      RendererStyleFlags2.DashCase,
    );
  }
}
