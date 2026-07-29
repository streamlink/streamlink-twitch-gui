import { invoke } from "../tauri";

export class HelixError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "HelixError";
  }
}

let cachedClientId: string | null = null;
let cachedToken: { value: string; expiresAt: number } | null = null;

export function clearHelixAuthCache(): void {
  cachedClientId = null;
  cachedToken = null;
}

async function clientId(): Promise<string> {
  if (cachedClientId) {
    return cachedClientId;
  }
  const fromEnv = import.meta.env.VITE_TWITCH_CLIENT_ID as string | undefined;
  if (fromEnv) {
    cachedClientId = fromEnv;
    return fromEnv;
  }
  cachedClientId = await invoke<string>("get_twitch_client_id");
  return cachedClientId;
}

async function accessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }
  const value = await invoke<string>("auth_get_access_token");
  // Short client-side cache; Rust still refreshes when needed.
  cachedToken = { value, expiresAt: now + 45_000 };
  return value;
}

export async function helixFetch<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const [cid, token] = await Promise.all([clientId(), accessToken()]);
  const url = new URL(`https://api.twitch.tv/helix/${path.replace(/^\//, "")}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url, {
    headers: {
      "Client-Id": cid,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    clearHelixAuthCache();
    throw new HelixError("unauthorized", 401);
  }
  if (res.status === 429) {
    throw new HelixError("rateLimited", 429);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new HelixError(body || res.statusText, res.status);
  }
  return (await res.json()) as T;
}

export interface HelixPage<T> {
  data: T[];
  pagination?: { cursor?: string };
}

export interface HelixStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  is_mature: boolean;
}

export interface HelixUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

export function streamThumbnail(url: string, width = 440, height = 248): string {
  return url
    .replace("{width}", String(width))
    .replace("{height}", String(height));
}

export async function getFollowedStreams(
  userId: string,
  cursor?: string,
): Promise<HelixPage<HelixStream>> {
  return helixFetch<HelixPage<HelixStream>>("streams/followed", {
    user_id: userId,
    first: 25,
    after: cursor,
  });
}

export async function getTopStreams(
  cursor?: string,
): Promise<HelixPage<HelixStream>> {
  return helixFetch<HelixPage<HelixStream>>("streams", {
    first: 25,
    after: cursor,
  });
}

export interface HelixGame {
  id: string;
  name: string;
  box_art_url: string;
}

export interface HelixChannel {
  id: string;
  broadcaster_login: string;
  display_name: string;
  game_id: string;
  game_name: string;
  title: string;
  thumbnail_url: string;
  is_live: boolean;
}

export interface HelixTeam {
  id: string;
  team_name: string;
  team_display_name: string;
  background_image_url: string | null;
  thumbnail_url: string;
}

export function gameBoxArt(url: string, width = 144, height = 192): string {
  return url
    .replace("{width}", String(width))
    .replace("{height}", String(height));
}

export async function getTopGames(
  cursor?: string,
): Promise<HelixPage<HelixGame>> {
  return helixFetch<HelixPage<HelixGame>>("games/top", {
    first: 25,
    after: cursor,
  });
}

export async function getStreamsByGame(
  gameId: string,
  cursor?: string,
): Promise<HelixPage<HelixStream>> {
  return helixFetch<HelixPage<HelixStream>>("streams", {
    game_id: gameId,
    first: 25,
    after: cursor,
  });
}

export async function searchChannels(
  query: string,
  cursor?: string,
): Promise<HelixPage<HelixChannel>> {
  return helixFetch<HelixPage<HelixChannel>>("search/channels", {
    query,
    first: 25,
    after: cursor,
  });
}

export async function searchCategories(
  query: string,
  cursor?: string,
): Promise<HelixPage<HelixGame>> {
  return helixFetch<HelixPage<HelixGame>>("search/categories", {
    query,
    first: 25,
    after: cursor,
  });
}

export async function getChannelStreams(
  userLogin: string,
): Promise<HelixPage<HelixStream>> {
  return helixFetch<HelixPage<HelixStream>>("streams", {
    user_login: userLogin,
    first: 1,
  });
}

export async function getUsersByLogin(
  logins: string[],
): Promise<HelixPage<HelixUser>> {
  const [cid, token] = await Promise.all([clientId(), accessToken()]);
  const url = new URL("https://api.twitch.tv/helix/users");
  for (const login of logins) {
    url.searchParams.append("login", login);
  }
  const res = await fetch(url, {
    headers: {
      "Client-Id": cid,
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    clearHelixAuthCache();
    throw new HelixError("unauthorized", 401);
  }
  if (!res.ok) throw new HelixError(await res.text(), res.status);
  return (await res.json()) as HelixPage<HelixUser>;
}

export async function getChannelTeams(
  broadcasterId: string,
): Promise<HelixPage<HelixTeam>> {
  return helixFetch<HelixPage<HelixTeam>>("teams/channel", {
    broadcaster_id: broadcasterId,
  });
}

export interface HelixTeamMember {
  user_id: string;
  user_name: string;
  user_login: string;
}

export interface HelixTeamDetail extends HelixTeam {
  users?: HelixTeamMember[];
  info?: string;
}

export async function getTeamByName(
  name: string,
): Promise<HelixTeamDetail | null> {
  const page = await helixFetch<HelixPage<HelixTeamDetail>>("teams", {
    name,
  });
  return page.data[0] ?? null;
}

export async function getStreamsByUserIds(
  userIds: string[],
): Promise<HelixStream[]> {
  if (!userIds.length) return [];
  const [cid, token] = await Promise.all([clientId(), accessToken()]);
  const streams: HelixStream[] = [];
  for (let i = 0; i < userIds.length; i += 100) {
    const batch = userIds.slice(i, i + 100);
    const url = new URL("https://api.twitch.tv/helix/streams");
    for (const id of batch) {
      url.searchParams.append("user_id", id);
    }
    url.searchParams.set("first", String(Math.min(100, batch.length)));
    const res = await fetch(url, {
      headers: {
        "Client-Id": cid,
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      clearHelixAuthCache();
      throw new HelixError("unauthorized", 401);
    }
    if (!res.ok) throw new HelixError(await res.text(), res.status);
    const page = (await res.json()) as HelixPage<HelixStream>;
    streams.push(...page.data);
  }
  return streams;
}
