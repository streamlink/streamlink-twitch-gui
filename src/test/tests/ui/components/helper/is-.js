import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import { helper as IsEqualHelper } from "ui/components/helper/is-equal";
import { helper as IsNullHelper } from "ui/components/helper/is-null";
import { helper as IsGtHelper } from "ui/components/helper/is-gt";
import { helper as IsGteHelper } from "ui/components/helper/is-gte";


moduleForComponent( "ui/components/helper/is-", {
	integration: true,
	resolver: buildResolver({
		IsEqualHelper,
		IsNullHelper,
		IsGtHelper,
		IsGteHelper
	})
});


test( "Is equal", function( assert ) {

	this.set( "valA", "foo" );
	this.set( "valB", "foo" );
	this.set( "valC", "foo" );
	this.render( hbs`{{is-equal valA valB valC}}` );

	assert.strictEqual( this.$().text(), "true", "Equal values" );

	this.set( "valC", "bar" );
	assert.strictEqual( this.$().text(), "false", "Unequal values" );

});


test( "Is null", function( assert ) {

	this.set( "valA", null );
	this.set( "valB", null );
	this.set( "valC", null );
	this.render( hbs`{{is-null valA valB valC}}` );

	assert.strictEqual( this.$().text(), "true", "All values are null" );

	this.set( "valC", false );
	assert.strictEqual( this.$().text(), "false", "Some values are not null" );

});


test( "Is greater than", function( assert ) {

	this.set( "valA", 2 );
	this.set( "valB", 1 );
	this.render( hbs`{{is-gt valA valB}}` );

	assert.strictEqual( this.$().text(), "true", "2 is greater than 1" );

	this.set( "valA", 0 );
	assert.strictEqual( this.$().text(), "false", "0 is not greater than 1" );

});


test( "Is greater than or equal", function( assert ) {

	this.set( "valA", 2 );
	this.set( "valB", 1 );
	this.render( hbs`{{is-gte valA valB}}` );

	assert.strictEqual( this.$().text(), "true", "2 is greater than or equal 1" );

	this.set( "valA", 1 );
	assert.strictEqual( this.$().text(), "true", "1 is greater than or equal 1" );

	this.set( "valA", 0 );
	assert.strictEqual( this.$().text(), "false", "0 is not greater than or equal 1" );

});
