const fetch = require( "node-fetch" );


const defaultRepo = process.env[ "GITHUB_REPOSITORY" ] || require( "../../../package.json" ).name;


/**
 * @param {string?} repo
 * @param {string?} apikey
 * @return {function(string, RequestInit=, string=): *}
 */
function githubApi( repo = defaultRepo, apikey = "" ) {
	const headers = {
		"Accept": "application/vnd.github.v3+json",
		"User-Agent": repo
	};
	if ( apikey ) {
		headers[ "Authorization" ] = `token ${apikey}`;
	}

	/**
	 * @param {string} path
	 * @param {RequestInit?} req
	 * @param {string="api"} host
	 * @returns {Promise<Object>}
	 */
	async function githubApiCall( path, req = {}, host = "api" ) {
		const url = `https://${host}.github.com${path}`;
		req.headers = Object.assign( req.headers || {}, headers );

		const resp = await fetch( url, req );

		return await resp.json();
	}

	return githubApiCall;
}


module.exports = githubApi;
