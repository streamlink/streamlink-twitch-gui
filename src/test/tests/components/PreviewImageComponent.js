import {
	moduleForComponent,
	test
} from "ember-qunit";
import {
	buildResolver,
	hbs
} from "test-utils";
import { run } from "ember";
import PreviewImageComponent from "components/PreviewImageComponent";
import transparentImage from "transparent-image";


const { scheduleOnce } = run;


moduleForComponent( "components/PreviewImageComponent", {
	integration: true,
	resolver: buildResolver({
		PreviewImageComponent
	})
});


test( "Valid image source", function( assert ) {

	const done = assert.async();

	this.set( "src", transparentImage );
	this.set( "title", "bar" );
	this.set( "onLoad", () => {
		assert.ok(
			this.$( ".previewImage" ).get( 0 ) instanceof HTMLImageElement,
			"Image loads correctly"
		);
		done();
	});
	this.set( "onError", () => {
		assert.ok( false, "Should not fail" );
		done();
	});
	this.render( hbs`{{preview-image src=src title=title onLoad=onLoad onError=onError}}` );

	assert.ok(
		this.$( "img" ).get( 0 ) instanceof HTMLImageElement,
		"Has an image element before loading"
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


test( "Invalid image source", function( assert ) {

	const done = assert.async();

	this.set( "src", "./foo" );
	this.set( "title", "bar" );
	this.set( "onLoad", () => {
		assert.ok( false, "Should not load" );
		done();
	});
	this.set( "onError", () => {
		assert.ok(
			this.$( ".previewError" ).get( 0 ),
			"Is in error state"
		);
		assert.equal(
			this.$( ".previewError" ).eq( 0 ).attr( "title" ),
			"bar",
			"Error element has a title"
		);
		done();
	});

	this.render( hbs`{{preview-image src=src title=title onLoad=onLoad onError=onError}}` );

	assert.ok(
		this.$( "img" ).get( 0 ) instanceof HTMLImageElement,
		"Has an image element before loading"
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
