export interface PresenceSource {
  channelLogin: string;
  channelId: string;
  broadcastId: string;
}

export type PresenceMetadata = Record<string, PresenceSource>;

export interface PresenceSession {
  id: string;
  running: boolean;
  ready?: boolean;
}

export interface ViewerPresenceTarget extends PresenceSource {
  sessionId: string;
}

export function prunePresenceMetadata(
  metadata: PresenceMetadata,
  sessions: PresenceSession[],
): PresenceMetadata {
  const active = new Set(sessions.map((session) => session.id));
  return Object.fromEntries(
    Object.entries(metadata).filter(([sessionId]) => active.has(sessionId)),
  );
}

export function buildPresenceTargets(
  sessions: PresenceSession[],
  metadata: PresenceMetadata,
  preferredSessionIds: string[] = [],
): ViewerPresenceTarget[] {
  const rank = new Map(
    preferredSessionIds.map((sessionId, index) => [sessionId, index]),
  );
  const fallbackRank = preferredSessionIds.length;
  const ordered = sessions
    .map((session, index) => ({ session, index }))
    .sort((left, right) => {
      const leftRank = rank.get(left.session.id) ?? fallbackRank + left.index;
      const rightRank = rank.get(right.session.id) ?? fallbackRank + right.index;
      return leftRank - rightRank;
    })
    .map(({ session }) => session);

  return ordered
    .filter((session) => session.running && session.ready)
    .flatMap((session) => {
      const source = metadata[session.id];
      if (
        !source?.channelLogin.trim() ||
        !source.channelId.trim() ||
        !source.broadcastId.trim()
      ) {
        return [];
      }
      return [
        {
          sessionId: session.id,
          channelLogin: source.channelLogin.toLowerCase(),
          channelId: source.channelId,
          broadcastId: source.broadcastId,
        },
      ];
    })
    .slice(0, 2);
}
