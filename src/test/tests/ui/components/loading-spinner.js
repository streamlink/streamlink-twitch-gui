import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import LoadingSpinnerComponent from "ui/components/loading-spinner/component";


moduleForComponent( "ui/components/loading-spinner", {
	integration: true,
	resolver: buildResolver({
		LoadingSpinnerComponent
	})
});


test( "LoadingSpinnerComponent", function( assert ) {

	this.render( hbs`{{loading-spinner}}` );

	const $elem = this.$( "svg.loading-spinner-component" );

	assert.ok(
		$elem.get( 0 ) instanceof SVGElement,
		"Finds the loading spinner"
	);

	assert.notEqual(
		$elem.eq( 0 ).attr( "viewBox" ),
		undefined,
		"SVG element has a viewBox attribute"
	);

	assert.notEqual(
		$elem.find( "circle" ).eq( 0 ).attr( "r" ),
		undefined,
		"Circle has a radius attribute"
	);

});
