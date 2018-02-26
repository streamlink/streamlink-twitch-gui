import { module, test } from "qunit";

import shellInjector from "inject-loader!nwjs/Shell";


module( "nwjs/Shell" );


test( "OpenBrowser", assert => {

	function openBrowser() {
		let url = null;
		const _openBrowser = shellInjector({
			"nwjs/nwGui": {
				Shell: {
					openExternal( _url ) {
						url = _url;
					}
				}
			}
		})[ "openBrowser" ];

		return _openBrowser( ...arguments )
			.then(
				data => Promise.resolve({ url, data }),
				error => Promise.reject({ url, error })
			);
	}

	return Promise.all([
		openBrowser()
			.catch( ({ url, error }) => {
				assert.ok( error instanceof Error, "Throws error when URL is missing" );
				assert.strictEqual( url, null, "No URL has been opened" );
			}),
		openBrowser( "foo" )
			.then( ({ url, data }) => {
				assert.strictEqual( url, "foo", "Opens simple URL" );
				assert.strictEqual( url, data, "Returns opened URL" );
			}),
		openBrowser( "foo/{bar}/{baz}/{bar}", { bar: "bar", baz: "baz" } )
			.then( ({ url, data }) => {
				assert.strictEqual( url, "foo/bar/baz/bar", "Substitutes variables" );
				assert.strictEqual( url, data, "Returns opened URL" );
			}),
		openBrowser( "{foo}" )
			.catch( ({ url, error }) => {
				assert.ok( error instanceof Error, "Throws error on substitution error" );
				assert.strictEqual( url, null, "No URL has been opened" );
			})
	]);

});
