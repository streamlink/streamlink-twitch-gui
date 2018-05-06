import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import { scheduleOnce } from "@ember/runloop";
import transparentImage from "transparent-image";

import PreviewImageComponent from "ui/components/preview-image/component";


moduleForComponent( "ui/components/preview-image", {
	integration: true,
	resolver: buildResolver({
		PreviewImageComponent
	})
});


test( "Valid image source", async function( assert ) {

	assert.expect( 4 );

	await new Promise( ( resolve, reject ) => {
		this.set( "src", transparentImage );
		this.set( "title", "bar" );
		this.set( "onLoad", resolve );
		this.set( "onError", reject );
		this.render( hbs`{{preview-image src=src title=title onLoad=onLoad onError=onError}}` );

		assert.ok(
			this.$( "img" ).get( 0 ) instanceof HTMLImageElement,
			"Has an image element before loading"
		);
	});

	assert.ok(
		this.$( ".previewImage" ).get( 0 ) instanceof HTMLImageElement,
		"Image loads correctly"
	);
	assert.equal(
		this.$( "img" ).eq( 0 ).attr( "src" ),
		transparentImage,
		"Has the correct image source"
	);
	assert.equal(
		this.$( "img" ).eq( 0 ).attr( "title" ),
		"bar",
		"Has the correct element title"
	);

});


test( "Invalid image source", async function( assert ) {

	assert.expect( 3 );

	await new Promise( ( resolve, reject ) => {
		this.set( "src", "./foo" );
		this.set( "title", "bar" );
		this.set( "onLoad", reject );
		this.set( "onError", resolve );
		this.render( hbs`{{preview-image src=src title=title onLoad=onLoad onError=onError}}` );

		assert.ok(
			this.$( "img" ).get( 0 ) instanceof HTMLImageElement,
			"Has an image element before loading"
		);
	});

	assert.ok(
		this.$( ".previewError" ).get( 0 ),
		"Is in error state"
	);
	assert.equal(
		this.$( ".previewError" ).eq( 0 ).attr( "title" ),
		"bar",
		"Error element has a title"
	);

});


test( "Missing image source", function( assert ) {

	const done = assert.async();

	this.set( "src", transparentImage );
	this.render( hbs`{{preview-image}}` );

	assert.strictEqual(
		this.$( "img" ).get( 0 ),
		undefined,
		"Does not have an image element"
	);

	scheduleOnce( "afterRender", () => {
		assert.ok(
			this.$( ".previewError" ).get( 0 ),
			"Is in error state"
		);
		done();
	});

});
