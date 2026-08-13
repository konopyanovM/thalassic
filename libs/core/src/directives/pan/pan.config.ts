import {
  PAN_DEFAULT_EDGE_SIZE,
  PAN_DEFAULT_LOCK_RATIO,
  PAN_DEFAULT_THRESHOLD,
} from './pan.constants';
import { panAxis, panEdge } from './pan.types';

/**
 * Fallback values for every {@link PanDirective} input, resolved through the
 * `PAN_CONFIG` token.
 *
 * A template can bind the inputs directly and needs none of this. The token
 * exists for a host that has no template to bind from — a directive applied
 * through `hostDirectives` on a component instantiated imperatively (a CDK
 * dialog or overlay container) cannot receive input bindings, so its
 * configuration has to arrive through the injector instead. Provide the token
 * on an ancestor injector of the host element; a binding always wins over it.
 */
export interface PanConfig {
  enabled: boolean;
  manageTouchAction: boolean;
  axis: panAxis;
  threshold: number;
  lockRatio: number;
  edge: panEdge | null;
  edgeSize: number;
  pointerTypes: readonly string[] | null;
}

export const DEFAULT_PAN_CONFIG: PanConfig = {
  enabled: true,
  manageTouchAction: true,
  axis: 'both',
  threshold: PAN_DEFAULT_THRESHOLD,
  lockRatio: PAN_DEFAULT_LOCK_RATIO,
  edge: null,
  edgeSize: PAN_DEFAULT_EDGE_SIZE,
  pointerTypes: null,
};
