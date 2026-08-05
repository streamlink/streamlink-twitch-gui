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
): ViewerPresenceTarget[] {
  return sessions
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
