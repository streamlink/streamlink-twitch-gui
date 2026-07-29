import { invoke } from "@tauri-apps/api/core";

export class HelixError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "HelixError";
  }
}

async function clientId(): Promise<string> {
  const fromEnv = import.meta.env.VITE_TWITCH_CLIENT_ID as string | undefined;
  if (fromEnv) {
    return fromEnv;
  }
  return invoke<string>("get_twitch_client_id");
}

async function accessToken(): Promise<string> {
  return invoke<string>("auth_get_access_token");
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
  return url.replace("{width}", String(width)).replace("{height}", String(height));
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
  return url.replace("{width}", String(width)).replace("{height}", String(height));
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
  if (res.status === 401) throw new HelixError("unauthorized", 401);
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
