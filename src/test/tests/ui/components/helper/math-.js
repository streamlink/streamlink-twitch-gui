import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { helper as MathAddHelper } from "ui/components/helper/math-add";
import { helper as MathSubHelper } from "ui/components/helper/math-sub";
import { helper as MathMulHelper } from "ui/components/helper/math-mul";
import { helper as MathDivHelper } from "ui/components/helper/math-div";


module( "ui/components/helper/math-", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			MathAddHelper,
			MathSubHelper,
			MathMulHelper,
			MathDivHelper
		})
	});


	test( "Math add", async function( assert ) {
		this.setProperties({
			valA: 1,
			valB: 2
		});
		await render( hbs`{{math-add valA valB}}` );

		assert.strictEqual( this.element.innerText, "3", "1 + 2 = 3" );
	});


	test( "Math sub", async function( assert ) {
		this.setProperties({
			valA: 1,
			valB: 2
		});
		await render( hbs`{{math-sub valA valB}}` );

		assert.strictEqual( this.element.innerText, "-1", "1 - 2 = -1" );
	});


	test( "Math mul", async function( assert ) {
		this.setProperties({
			valA: 7,
			valB: 7
		});
		await render( hbs`{{math-mul valA valB}}` );

		assert.strictEqual( this.element.innerText, "49", "7 * 7 = 49" );
	});


	test( "Math div", async function( assert ) {
		this.setProperties({
			valA: 12,
			valB: 3
		});
		await render( hbs`{{math-div valA valB}}` );

		assert.strictEqual( this.element.innerText, "4", "12 / 3 = 4" );
	});

});
