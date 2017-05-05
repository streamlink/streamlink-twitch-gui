import Cache from "./cache";


/** @type {Cache} */
export const providerCache = new Cache( "exec" );


export function clearCache() {
	providerCache.clear();
}
