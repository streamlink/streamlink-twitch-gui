import Cache from "./cache";


/** @type {Cache} */
export const providerCache = new Cache( "exec" );

/** @type {Cache} */
export const playerCache = new Cache( "exec" );

export function clearCache() {
	providerCache.clear();
	playerCache.clear();
}
