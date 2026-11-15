import {
  SETTLE_MAX_DURATION,
  SETTLE_REST_DISTANCE,
  SETTLE_SAMPLE_INTERVAL,
  SETTLE_SPRING_RESPONSE,
} from './sheet-motion.constants';
import { SettleCurve } from './sheet-motion.types';

/**
 * The travel of a critically damped spring over `distance` px, launched at
 * `velocity` px/ms, as a duration and a `linear()` easing for a CSS transition
 * to play. Both are signed along one axis, so a velocity that shares the
 * distance's sign heads for the target.
 *
 * Launched with the finger's speed, the surface leaves the release at the pace
 * it was moving and eases into the target, instead of starting every settle at
 * one fixed curve's speed whatever the hand was doing. The launch is capped at
 * the spring's own angular frequency, the fastest a critically damped spring
 * can start without passing its target — a surface that overshot its largest
 * detent would lift off the edge it is pinned to. A launch away from the target
 * carries on that way briefly before the spring turns it round, as momentum
 * does on the platforms.
 *
 * @example
 * settleCurve(0.2, 0);   // { duration: 0, easing: 'linear' } — already there
 * settleCurve(300, 0);   // { duration: 450, easing: 'linear(0, 0.0405, 0.1323, …, 1)' } — from rest, gathers speed
 * settleCurve(300, 1.5); // { duration: 433, easing: 'linear(0, 0.0989, 0.2174, …, 1)' } — launch capped at the frequency
 * settleCurve(40, -0.4); // { duration: 350, easing: 'linear(0, -0.0767, -0.0402, …, 1)' } — carries on away, then turns
 */
export function settleCurve(distance: number, velocity: number): SettleCurve {
  const span = Math.abs(distance);
  if (span < SETTLE_REST_DISTANCE) return { duration: 0, easing: 'linear' };

  const frequency = (2 * Math.PI) / SETTLE_SPRING_RESPONSE;
  // Progress per ms the spring starts at, clamped both ways to the frequency.
  const launch = Math.max(-frequency, Math.min(frequency, velocity / distance));
  // Critically damped: what is left of the travel is (1 + (ω − v₀)·t)·e^(−ω·t).
  const progressAt = (time: number): number =>
    1 - (1 + (frequency - launch) * time) * Math.exp(-frequency * time);

  let duration = SETTLE_SAMPLE_INTERVAL;
  while (
    duration < SETTLE_MAX_DURATION &&
    Math.abs(1 - progressAt(duration)) * span >= SETTLE_REST_DISTANCE
  ) {
    duration += SETTLE_SAMPLE_INTERVAL;
  }

  const steps = Math.ceil(duration / SETTLE_SAMPLE_INTERVAL);
  const points: string[] = [];
  for (let step = 0; step < steps; step += 1) {
    points.push(`${Number(progressAt((duration * step) / steps).toFixed(4))}`);
  }
  // The residual under the rest distance lands with the final point.
  points.push('1');

  return { duration: Math.round(duration), easing: `linear(${points.join(', ')})` };
}
