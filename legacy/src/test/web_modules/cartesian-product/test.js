import { module, test } from "qunit";

import cartesian from "./index";


module( "cartesian-product", function() {
	test( "Cartesian product", function( assert ) {
		const prod = cartesian( [ 1, 2, 3 ], [ 4, 5 ], [ 6, 7 ], [ 8 ] );
		assert.propEqual( prod, [
			[ 1, 4, 6, 8 ],
			[ 1, 4, 7, 8 ],
			[ 1, 5, 6, 8 ],
			[ 1, 5, 7, 8 ],
			[ 2, 4, 6, 8 ],
			[ 2, 4, 7, 8 ],
			[ 2, 5, 6, 8 ],
			[ 2, 5, 7, 8 ],
			[ 3, 4, 6, 8 ],
			[ 3, 4, 7, 8 ],
			[ 3, 5, 6, 8 ],
			[ 3, 5, 7, 8 ]
		], "Correctly builds the cartesian product of multiple input arrays of various lengths" );
	});
});
