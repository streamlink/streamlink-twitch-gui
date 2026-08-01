/** Pure helpers for outgoing-raid prompt queueing. */

export interface RaidOutgoingEvent {
  fromChannel: string;
  toChannel: string;
  toUserId: string;
  viewers?: number;
}

export function raidDedupeKey(e: RaidOutgoingEvent): string {
  return `${e.fromChannel.toLowerCase()}->${e.toChannel.toLowerCase()}`;
}

/** Normalize logins; drop duplicate from→to already in the queue. */
export function enqueueRaid(
  queue: RaidOutgoingEvent[],
  next: RaidOutgoingEvent,
): RaidOutgoingEvent[] {
  const normalized: RaidOutgoingEvent = {
    fromChannel: next.fromChannel.toLowerCase(),
    toChannel: next.toChannel.toLowerCase(),
    toUserId: next.toUserId,
    viewers: next.viewers,
  };
  const key = raidDedupeKey(normalized);
  if (queue.some((e) => raidDedupeKey(e) === key)) {
    return queue;
  }
  return [...queue, normalized];
}
