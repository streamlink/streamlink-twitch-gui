import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import MathAddHelper from "helpers/MathAddHelper";
import MathSubHelper from "helpers/MathSubHelper";
import MathMulHelper from "helpers/MathMulHelper";
import MathDivHelper from "helpers/MathDivHelper";


moduleForComponent( "helpers/math-", {
	integration: true,
	resolver: buildResolver({
		MathAddHelper,
		MathSubHelper,
		MathMulHelper,
		MathDivHelper
	})
});


test( "Math add", function( assert ) {

	this.set( "valA", 1 );
	this.set( "valB", 2 );
	this.render( hbs`{{math-add valA valB}}` );

	assert.strictEqual( this.$().text(), "3", "1 + 2 = 3" );

});


test( "Math sub", function( assert ) {

	this.set( "valA", 1 );
	this.set( "valB", 2 );
	this.render( hbs`{{math-sub valA valB}}` );

	assert.strictEqual( this.$().text(), "-1", "1 - 2 = -1" );

});


test( "Math mul", function( assert ) {

	this.set( "valA", 7 );
	this.set( "valB", 7 );
	this.render( hbs`{{math-mul valA valB}}` );

	assert.strictEqual( this.$().text(), "49", "7 * 7 = 49" );

});


test( "Math div", function( assert ) {

	this.set( "valA", 12 );
	this.set( "valB", 3 );
	this.render( hbs`{{math-div valA valB}}` );

	assert.strictEqual( this.$().text(), "4", "12 / 3 = 4" );

});
