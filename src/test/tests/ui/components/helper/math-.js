import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import { helper as MathAddHelper } from "ui/components/helper/math-add";
import { helper as MathSubHelper } from "ui/components/helper/math-sub";
import { helper as MathMulHelper } from "ui/components/helper/math-mul";
import { helper as MathDivHelper } from "ui/components/helper/math-div";


moduleForComponent( "ui/components/helper/math-", {
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
