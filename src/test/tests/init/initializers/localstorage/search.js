import { module, test } from "qunit";

import updateSearch from "init/initializers/localstorage/search";


module( "init/initializers/localstorage/search", function() {
	test( "Removes 'streams' filter", function( assert ) {
		const data = {
			"1": { id: "1", filter: "channels", query: "foo" },
			"2": { id: "2", filter: "streams", query: "foo" },
			"3": { id: "3", filter: "streams", query: "bar" },
			"4": { id: "4", filter: "all", query: "foo" }
		};

		updateSearch( data );

		assert.propEqual( data, {
			"1": { id: "1", filter: "channels", query: "foo" },
			"3": { id: "3", filter: "channels", query: "bar" },
			"4": { id: "4", filter: "all", query: "foo" }
		});
	});
});
