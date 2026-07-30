import { invoke } from "../tauri";

/**
 * All Helix calls are proxied through the Rust `helix_fetch` command so the
 * OAuth access token never exists in webview JS. Errors come back as strings
 * like "helix 401: …" / "not logged in".
 */

export type HelixQuery = Record<string, string | number | undefined>;

type QueryPairs = Array<[string, string]>;

function toPairs(query?: HelixQuery): QueryPairs {
  if (!query) return [];
  const pairs: QueryPairs = [];
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      pairs.push([key, String(value)]);
    }
  }
  return pairs;
}

async function helixFetchPairs<T>(path: string, pairs: QueryPairs): Promise<T> {
  return invoke<T>("helix_fetch", { path, query: pairs });
}

export async function helixFetch<T>(
  path: string,
  query?: HelixQuery,
): Promise<T> {
  return helixFetchPairs<T>(path, toPairs(query));
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
  return helixFetchPairs<HelixPage<HelixUser>>(
    "users",
    logins.map((login) => ["login", login]),
  );
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
  const streams: HelixStream[] = [];
  for (let i = 0; i < userIds.length; i += 100) {
    const batch = userIds.slice(i, i + 100);
    const pairs: QueryPairs = batch.map((id) => ["user_id", id]);
    pairs.push(["first", String(Math.min(100, batch.length))]);
    const page = await helixFetchPairs<HelixPage<HelixStream>>(
      "streams",
      pairs,
    );
    streams.push(...page.data);
  }
  return streams;
}
