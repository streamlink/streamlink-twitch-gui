import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import { helper as GetParamHelper } from "ui/components/helper/get-param";
import { helper as GetIndexHelper } from "ui/components/helper/get-index";


moduleForComponent( "ui/components/helper/get-", {
	integration: true,
	resolver: buildResolver({
		GetParamHelper,
		GetIndexHelper
	})
});


test( "Get param", function( assert ) {

	this.set( "param", "baz" );
	this.set( "index", 0 );
	this.render( hbs`{{get-param "foo" "bar" param index=index}}` );

	assert.strictEqual( this.$().text(), "foo", "First parameter's value is foo" );

	this.set( "index", 2 );
	assert.strictEqual( this.$().text(), "baz", "Bound parameter" );

	this.set( "param", "qux" );
	assert.strictEqual( this.$().text(), "qux", "Changed bound parameter" );

});


test( "Get index", function( assert ) {

	this.set( "arr", [ 4, 5, 6 ] );
	this.set( "prop", 1 );
	this.render( hbs`{{get-index arr prop}}` );

	assert.strictEqual( this.$().text(), "5", "Gets the correcy value" );

	this.set( "prop", 2 );
	assert.strictEqual( this.$().text(), "6", "Change index" );

	this.set( "prop", 9999 );
	assert.strictEqual( this.$().text(), "", "Non-existing index" );

});
