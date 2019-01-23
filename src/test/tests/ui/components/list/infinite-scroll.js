import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver, checkListeners } from "test-utils";
import { FakeI18nService, FakeTHelper } from "i18n-utils";
import { render, clearRender, click, triggerEvent } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { A } from "@ember/array";
import Component from "@ember/component";
import { run } from "@ember/runloop";

import InfiniteScrollComponent from "ui/components/list/infinite-scroll/component";


module( "ui/components/list/infinite-scroll", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			InfiniteScrollComponent,
			LoadingSpinnerComponent: Component.extend(),
			I18nService: FakeI18nService,
			THelper: FakeTHelper
		})
	});


	test( "Button states", async function( assert ) {
		this.setProperties({
			content: [],
			isFetching: false,
			hasFetchedAll: false,
			fetchError: false,
			action() {}
		});

		await render( hbs`
			{{infinite-scroll
				content=content
				isFetching=isFetching
				hasFetchedAll=hasFetchedAll
				fetchError=fetchError
				action=action
			}}
		` );
		const elem = this.element.querySelector( ".infinite-scroll-component" );

		assert.strictEqual(
			elem.innerText,
			"components.infinite-scroll.fetch",
			"Initial state"
		);
		assert.notOk( elem.hasAttribute( "disabled" ), "No disabled attr" );

		this.setProperties({
			isFetching: true,
			hasFetchedAll: false,
			fetchError: false
		});
		assert.strictEqual(
			elem.innerText,
			"components.infinite-scroll.loading",
			"Loading state"
		);
		assert.ok( elem.hasAttribute( "disabled" ), "Disabled attr" );

		this.setProperties({
			isFetching: false,
			hasFetchedAll: false,
			fetchError: true
		});
		assert.strictEqual(
			elem.innerText,
			"components.infinite-scroll.error",
			"Error state"
		);

		this.setProperties({
			isFetching: false,
			hasFetchedAll: true,
			fetchError: false
		});
		assert.ok( elem.classList.contains( "hidden" ), "Hide when hasFetchedAll" );
	});


	test( "Clicks", async function( assert ) {
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

		await render( hbs`
			{{infinite-scroll
				content=content
				isFetching=isFetching
				hasFetchedAll=hasFetchedAll
				fetchError=fetchError
				action=action
			}}
		` );
		const elem = this.element.querySelector( ".infinite-scroll-component" );

		await click( elem );
		assert.strictEqual(
			callbackValue,
			true,
			"Clicking executes action with force param enabled"
		);
		callbackValue = null;

		this.setProperties({
			isFetching: true,
			hasFetchedAll: false
		});
		await click( elem );
		assert.strictEqual(
			callbackValue,
			null,
			"Can't click while loading"
		);

		this.setProperties({
			isFetching: false,
			hasFetchedAll: true
		});
		await click( elem );
		assert.strictEqual(
			callbackValue,
			null,
			"Can't click when having fetched all"
		);
	});


	test( "Parent element and event listeners", async function( assert ) {
		// custom parent
		await render( hbs`
			<div class="parent" style="height: 100px; overflow-y: auto">
				<div class="child" style="height: 1000px">
					{{infinite-scroll $parent=$parent listener=listener}}
				</div>
			</div>
		` );
		const parent = this.element.querySelector( ".parent" );
		const listener = this.get( "listener" );

		assert.strictEqual(
			this.get( "$parent" )[0],
			parent,
			"Finds the correct parent element with a scroll bar"
		);
		assert.ok(
			checkListeners( parent, "scroll", listener ),
			"Parent has a scroll listener"
		);
		assert.ok(
			checkListeners( window, "resize", listener ),
			"Window has a resize listener"
		);

		await clearRender();
		assert.notOk(
			checkListeners( parent, "scroll", listener ),
			"Unregisters scroll listener"
		);
		assert.notOk(
			checkListeners( window, "resize", listener ),
			"Unregisters resize listener"
		);

		// main.content parent
		await render( hbs`
			<main class="content">
				{{infinite-scroll $parent=$parent}}
			</main>
		` );
		assert.strictEqual(
			this.get( "$parent" )[0],
			this.element.querySelector( "main" ),
			"Uses main.content as fallback parent if it is available"
		);

		// document.body parent
		await render( hbs`
			{{infinite-scroll $parent=$parent}}
		` );
		assert.strictEqual(
			this.get( "$parent" )[0],
			document.body,
			"Uses the document body as ultimate fallback parent"
		);
	});


	test( "Scroll listener", async function( assert ) {
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

		// noinspection CssUnusedSymbol
		await render( hbs`
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
		const scrollParent = this.element.querySelector( ".parent" );

		scrollParent.scrollTop = scrollTop;
		await triggerEvent( scrollParent, "scroll" );
		assert.strictEqual(
			callbackValue,
			null,
			"Doesn't trigger action if below scroll threshold"
		);

		scrollParent.scrollTop = scrollTop + 1;
		await triggerEvent( scrollParent, "scroll" );
		assert.strictEqual(
			callbackValue,
			false,
			"Triggers action if above scroll threshold"
		);
	});


	test( "Call listener on content reduction", async function( assert ) {
		const content = A([ 1, 2, 3 ]);
		let called = false;

		this.setProperties({
			content,
			infiniteScroll() {
				called = true;
			}
		});

		await render( hbs`
			{{infinite-scroll content=content infiniteScroll=infiniteScroll}}
		` );

		assert.strictEqual( called, false, "Don't initially trigger the event listener" );

		run( () => content.removeAt( 0 ) );
		assert.strictEqual( called, true, "Trigger the listener after elements have been removed" );
	});

});
