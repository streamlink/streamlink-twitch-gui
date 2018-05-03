import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, checkListeners, hbs } from "test-utils";
import { I18nService, THelper } from "i18n-utils";
import { A as EmberNativeArray } from "@ember/array";
import Component from "@ember/component";
import { run } from "@ember/runloop";

import InfiniteScrollComponent from "ui/components/list/infinite-scroll/component";


moduleForComponent( "ui/components/list/infinite-scroll", {
	integration: true,
	resolver: buildResolver({
		InfiniteScrollComponent,
		I18nService,
		THelper
	}),
	beforeEach() {
		this.registry.register( "component:loading-spinner", Component.extend({}) );
	}
});


test( "Button states", function( assert ) {

	this.setProperties({
		content: [],
		isFetching: false,
		hasFetchedAll: false,
		fetchError: false,
		action() {}
	});

	this.render( hbs`
		{{infinite-scroll
			content=content
			isFetching=isFetching
			hasFetchedAll=hasFetchedAll
			fetchError=fetchError
			action=action
		}}
	` );
	const $elem = this.$( ".infinite-scroll-component" );

	assert.strictEqual(
		$elem.text().trim(),
		"components.infinite-scroll.fetch",
		"Initial state"
	);
	assert.strictEqual( $elem.attr( "disabled" ), undefined, "No disabled attr" );

	this.setProperties({
		isFetching: true,
		hasFetchedAll: false,
		fetchError: false
	});
	assert.strictEqual(
		$elem.text().trim(),
		"components.infinite-scroll.loading",
		"Loading state"
	);
	assert.strictEqual( $elem.attr( "disabled" ), "disabled", "Disabled attr" );

	this.setProperties({
		isFetching: false,
		hasFetchedAll: false,
		fetchError: true
	});
	assert.strictEqual(
		$elem.text().trim(),
		"components.infinite-scroll.error",
		"Error state"
	);

	this.setProperties({
		isFetching: false,
		hasFetchedAll: true,
		fetchError: false
	});
	assert.ok( $elem.hasClass( "hidden" ), "Hide when hasFetchedAll" );

});


test( "Clicks", function( assert ) {

	let callbackValue = null;
	this.setProperties({
		content: [],
		isFetching: false,
		hasFetchedAll: false,
		fetchError: false,
		action( value ) {
			callbackValue = value;
		}
	});

	this.render( hbs`
		{{infinite-scroll
			content=content
			isFetching=isFetching
			hasFetchedAll=hasFetchedAll
			fetchError=fetchError
			action=action
		}}
	` );
	const $elem = this.$( ".infinite-scroll-component" );

	$elem.click();
	assert.strictEqual( callbackValue, true, "Clicking executes action with force param enabled" );
	callbackValue = null;

	this.setProperties({
		isFetching: true,
		hasFetchedAll: false
	});
	$elem.click();
	assert.strictEqual( callbackValue, null, "Can't click while loading" );

	this.setProperties({
		isFetching: false,
		hasFetchedAll: true
	});
	$elem.click();
	assert.strictEqual( callbackValue, null, "Can't click when having fetched all" );

});


test( "Parent element and event listeners", function( assert ) {

	// custom parent
	this.render( hbs`
		<div class="parent" style="height: 100px; overflow-y: auto">
			<div class="child" style="height: 1000px">
				{{infinite-scroll $parent=$parent listener=listener}}
			</div>
		</div>
	` );
	const $parent = this.$( ".parent" );
	const listener = this.get( "listener" );

	assert.strictEqual(
		this.get( "$parent" )[0],
		$parent[0],
		"Finds the correct parent element with a scroll bar"
	);
	assert.ok( checkListeners( $parent[0], "scroll", listener), "Parent has a scroll listener" );
	assert.ok( checkListeners( window, "resize", listener), "Window has a resize listener" );

	this.clearRender();
	assert.notOk( checkListeners( $parent[0], "scroll", listener), "Unregisters scroll listener" );
	assert.notOk( checkListeners( window, "resize", listener), "Unregisters resize listener" );

	// main.content parent
	this.render( hbs`
		<main class="content">
			{{infinite-scroll $parent=$parent}}
		</main>
	` );
	assert.strictEqual(
		this.get( "$parent" )[0],
		this.$( "main" )[0],
		"Uses main.content as fallback parent if it is available"
	);

	// document.body parent
	this.render( hbs`
		{{infinite-scroll $parent=$parent}}
	` );
	assert.strictEqual(
		this.get( "$parent" )[0],
		document.body,
		"Uses the document body as ultimate fallback parent"
	);

});


test( "Scroll listener", function( assert ) {

	const viewHeight = 100;
	const elemHeight = 1000;
	const threshold = 2 / 3;
	const scrollTop = Math.floor( ( elemHeight - viewHeight ) - ( threshold * viewHeight ) );

	let callbackValue = null;
	this.setProperties({
		threshold,
		action( value ) {
			callbackValue = value;
		}
	});

	this.render( hbs`
		<style>
			/* Make sure component stylesheets don't interfere with the test */
			.infinite-scroll-component {
				margin: 0 !important;
			}
		</style>
		<div class="parent" style="height: ${viewHeight}px; overflow-y: auto">
			<div class="child" style="height: ${elemHeight}px">
				{{infinite-scroll action=action threshold=threshold}}
			</div>
		</div>
	` );
	const $scrollParent = this.$( ".parent" );

	$scrollParent[0].scrollTop = scrollTop;
	$scrollParent.scroll();
	assert.strictEqual( callbackValue, null, "Doesn't trigger action if below scroll threshold" );

	$scrollParent[0].scrollTop = scrollTop + 1;
	$scrollParent.scroll();
	assert.strictEqual( callbackValue, false, "Triggers action if above scroll threshold" );

});


test( "Call listener on content reduction", async function( assert ) {

	const content = new EmberNativeArray([ 1, 2, 3 ]);
	let called = false;

	this.setProperties({
		content,
		infiniteScroll() {
			called = true;
		}
	});

	this.render( hbs`{{infinite-scroll content=content infiniteScroll=infiniteScroll}}` );

	assert.strictEqual( called, false, "Don't initially trigger the event listener" );

	run( () => content.removeAt( 0 ) );
	assert.strictEqual( called, true, "Trigger the listener after elements have been removed" );

});
