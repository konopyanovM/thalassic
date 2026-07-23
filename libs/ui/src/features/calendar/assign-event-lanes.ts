import { CalendarEvent } from './calendar.types';

/** An event tagged with its horizontal lane and the lane count of its overlap cluster. */
export interface LaidOutEvent {
  event: CalendarEvent;
  lane: number;
  laneCount: number;
}

const eventEnd = (event: CalendarEvent): number => (event.end ?? event.start).getTime();

/**
 * Lays overlapping timed events out into side-by-side lanes. Events are grouped into clusters
 * of transitively-overlapping items; within each cluster every event gets a `lane` index and
 * the cluster's total `laneCount`, so a view can size each event to `1 / laneCount` of the
 * column width and offset it by its lane. Touching events (one ends exactly as the next starts)
 * share a lane rather than colliding.
 */
export const assignEventLanes = (events: CalendarEvent[]): LaidOutEvent[] => {
  const sorted = [...events].sort((first, second) => {
    const startDifference = first.start.getTime() - second.start.getTime();
    if (startDifference !== 0) return startDifference;
    // Longer events first so they anchor the leftmost lanes.
    return eventEnd(second) - eventEnd(first);
  });

  const result: LaidOutEvent[] = [];
  let cluster: LaidOutEvent[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = 0;

  const flushCluster = (): void => {
    for (const item of cluster) item.laneCount = laneEnds.length;
    result.push(...cluster);
    cluster = [];
    laneEnds = [];
    clusterEnd = 0;
  };

  for (const event of sorted) {
    const start = event.start.getTime();
    const end = eventEnd(event);

    // A gap from every active event closes the current cluster.
    if (cluster.length > 0 && start >= clusterEnd) flushCluster();

    let lane = laneEnds.findIndex(laneEnd => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }

    cluster.push({ event, lane, laneCount: 0 });
    clusterEnd = Math.max(clusterEnd, end);
  }
  flushCluster();

  return result;
};
