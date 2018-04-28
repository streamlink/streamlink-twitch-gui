import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import { helper as FormatViewersHelper } from "ui/components/helper/format-viewers";
import { helper as FormatTimeHelper } from "ui/components/helper/format-time";


moduleForComponent( "ui/components/helper/format-", {
	integration: true,
	resolver: buildResolver({
		FormatViewersHelper,
		FormatTimeHelper
	})
});


test( "Format viewers", function( assert ) {

	this.set( "viewers", "" );
	this.render( hbs`{{format-viewers viewers}}` );

	assert.strictEqual( this.$().text(), "0", "Unexpected values" );
	this.set( "viewers", "foo" );
	assert.strictEqual( this.$().text(), "0", "Unexpected values" );

	this.set( "viewers", 9 );
	assert.strictEqual( this.$().text(), "9", "Less than 5 digits" );
	this.set( "viewers", 99 );
	assert.strictEqual( this.$().text(), "99", "Less than 5 digits" );
	this.set( "viewers", 999 );
	assert.strictEqual( this.$().text(), "999", "Less than 5 digits" );
	this.set( "viewers", 9999 );
	assert.strictEqual( this.$().text(), "9999", "Less than 5 digits" );

	this.set( "viewers", 10000 );
	assert.strictEqual( this.$().text(), "10.0k", "Thousands" );
	this.set( "viewers", 10099 );
	assert.strictEqual( this.$().text(), "10.0k", "Thousands" );
	this.set( "viewers", 10100 );
	assert.strictEqual( this.$().text(), "10.1k", "Thousands" );
	this.set( "viewers", 99999 );
	assert.strictEqual( this.$().text(), "99.9k", "Thousands" );
	this.set( "viewers", 100000 );
	assert.strictEqual( this.$().text(), "100k", "Thousands" );
	this.set( "viewers", 999999 );
	assert.strictEqual( this.$().text(), "999k", "Thousands" );

	this.set( "viewers", 1000000 );
	assert.strictEqual( this.$().text(), "1.00m", "Millions" );
	this.set( "viewers", 1009999 );
	assert.strictEqual( this.$().text(), "1.00m", "Millions" );
	this.set( "viewers", 1010000 );
	assert.strictEqual( this.$().text(), "1.01m", "Millions" );

});


test( "Format time", function( assert ) {

	const time = new Date();

	this.set( "time", time );
	this.set( "format", "D" );
	this.render( hbs`{{format-time time format}}` );

	assert.strictEqual(
		this.$().text(),
		time.getDate().toString(),
		"Format time using a custom format"
	);

});
