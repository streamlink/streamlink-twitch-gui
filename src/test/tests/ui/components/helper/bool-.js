import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import { helper as BoolNotHelper } from "ui/components/helper/bool-not";
import { helper as BoolAndHelper } from "ui/components/helper/bool-and";
import { helper as BoolOrHelper } from "ui/components/helper/bool-or";


moduleForComponent( "ui/components/helper/bool-", {
	integration: true,
	resolver: buildResolver({
		BoolNotHelper,
		BoolAndHelper,
		BoolOrHelper
	})
});


test( "Bool not", function( assert ) {

	this.set( "valA", false );
	this.set( "valB", null );
	this.set( "valC", undefined );
	this.set( "valD", "" );
	this.render( hbs`{{bool-not valA valB valC valD}}` );

	assert.strictEqual( this.$().text(), "true", "All values are falsey" );

	this.set( "valA", true );
	assert.equal( this.$().text(), "false", "Not all values are falsey" );

});


test( "Bool and", function( assert ) {

	this.set( "valA", false );
	this.set( "valB", false );
	this.set( "valC", false );
	this.render( hbs`{{bool-and valA valB valC}}` );

	assert.strictEqual( this.$().text(), "false", "not A and not B and not C" );

	this.set( "valA", true );
	assert.strictEqual( this.$().text(), "false", "A and not B and not C" );

	this.set( "valB", true );
	assert.strictEqual( this.$().text(), "false", "A and B and not C" );

	this.set( "valC", true );
	assert.strictEqual( this.$().text(), "true", "A and B and C" );

});


test( "Bool or", function( assert ) {

	this.set( "valA", true );
	this.set( "valB", true );
	this.set( "valC", true );
	this.render( hbs`{{bool-or valA valB valC}}` );

	assert.strictEqual( this.$().text(), "true", "A or B or C" );

	this.set( "valA", false );
	assert.strictEqual( this.$().text(), "true", "not A or B or C" );

	this.set( "valB", false );
	assert.strictEqual( this.$().text(), "true", "not A or not B or C" );

	this.set( "valC", false );
	assert.strictEqual( this.$().text(), "false", "not A or not B or not C" );

});
