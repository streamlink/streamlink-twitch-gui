import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import LoadingSpinnerComponent from "ui/components/loading-spinner/component";


module( "ui/components/loading-spinner", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			LoadingSpinnerComponent
		})
	});


	test( "LoadingSpinnerComponent", async function( assert ) {
		await render( hbs`
			<style>
				.loading-spinner-component > circle {
					stroke-width: 10% !important;
				}
			</style>
			{{loading-spinner}}
		` );

		const elem = this.element.querySelector( ".loading-spinner-component" );

		assert.ok(
			elem instanceof SVGElement,
			"Finds the loading spinner"
		);

		assert.strictEqual(
			elem.getAttribute( "viewBox" ),
			"0 0 1 1",
			"SVG element has a viewBox attribute"
		);

		assert.strictEqual(
			elem.querySelector( "circle" ).getAttribute( "r" ),
			"40%",
			"Circle has a radius attribute"
		);
	});

});
