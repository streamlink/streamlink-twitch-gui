import { module, test } from "qunit";
import sinon from "sinon";

// noinspection ES6CheckImport
import infiniteScrollMixinCssInjector
	from "inject-loader!ui/routes/-mixins/routes/infinite-scroll/css";


module( "ui/routes/-mixins/routes/infinite-scroll/css", function( hooks ) {
	// use this for highlighting simple language injections in WebStorm
	const css = content => content;

	/** @typedef {TestContext} TestContextInfiniteScrollMixinCss */
	/** @this {TestContextInfiniteScrollMixinCss} */
	hooks.beforeEach(function() {
		const fakeDocument = {
			styleSheets: [],
			querySelector: new Function(),
			body: { clientHeight: 1000 }
		};
		this.styleSheetsStub = sinon.stub( fakeDocument, "styleSheets" ).value( [] );
		this.querySelectorStub = sinon.stub( fakeDocument, "querySelector" ).returns();

		this.setCss = cssContent => {
			const styleNode = document.createElement( "style" );
			styleNode.innerText = cssContent;
			document.head.appendChild( styleNode );
			this.styleSheetsStub.value([ styleNode.sheet ]);
			document.head.removeChild( styleNode );
		};

		this.subject = infiniteScrollMixinCssInjector({
			"nwjs/Window": {
				window: {
					CSSMediaRule: window.CSSMediaRule,
					CSSStyleRule: window.CSSStyleRule,
					innerWidth: 1000,
					document: fakeDocument
				}
			}
		});
	});


	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "No matching CSS rules", function( assert ) {
		const { getCachedMinWidths, getCachedMinHeights } = this.subject;
		this.setCss( css`
			.foo { color: red; }
		` );

		assert.propEqual( Array.from( getCachedMinWidths() ), [], "Empty min widths" );
		assert.propEqual( Array.from( getCachedMinHeights() ), [], "Empty min heights" );
	});

	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "cachedMinWidths", function( assert ) {
		const { getCachedMinWidths } = this.subject;
		assert.propEqual( Array.from( getCachedMinWidths() ), [], "Cache is empty" );

		this.setCss( css`
			/* max only */
			@media (max-width: 250px) { .foo { width: 100%; } }
			@media (max-width: 250px) { .bar { width: 100%; } }
			/* max first, min second */
			@media (max-width: 500px) and (min-width: 250px) { .foo { width: 50%; } }
			@media (max-width: 500px) and (min-width: 250px) { .bar { width: 33.333%; } }
			/* min first, max second */
			@media (min-width: 500px) and (max-width: 750px) { .foo { width: 33.333%; } }
			@media (min-width: 500px) and (max-width: 750px) { .bar { width: 25%; } }
			/* min only */
			@media (min-width: 1000px) { .foo { width: 25%; } }
			/* empty */
			@media (min-width: 1000px) {}
		` );
		assert.propEqual(
			Array.from( getCachedMinWidths() ),
			[
				[ ".foo", [
					{ minWidth: 250, numItems: 2 },
					{ minWidth: 500, numItems: 3 },
					{ minWidth: 1000, numItems: 4 }
				] ],
				[ ".bar", [
					{ minWidth: 250, numItems: 3 },
					{ minWidth: 500, numItems: 4 }
				] ]
			],
			"Finds all min-width media rules and calculates number of items for each selector"
		);

		this.setCss( css`
			@media ( min-width: 1500px ) { .baz { width: 100%; } }
		` );
		assert.propEqual(
			Array.from( getCachedMinWidths().keys() ),
			[ ".foo", ".bar" ],
			"Doesn't rebuild cache on consecutive calls"
		);
	});

	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "cachedMinHeights", function( assert ) {
		const { getCachedMinHeights } = this.subject;
		assert.propEqual( Array.from( getCachedMinHeights() ), [], "Cache is empty initially" );

		this.setCss( css`
			.foo, .bar { min-height: 100px; }
			.baz { min-height: 200px; }
		` );
		assert.propEqual(
			Array.from( getCachedMinHeights() ),
			[
				[ ".foo", 100 ],
				[ ".bar", 100 ],
				[ ".baz", 200 ]
			],
			"Finds multiple min-height declarations"
		);

		this.setCss( css`
			.qux { min-height: 300px; }
		` );
		assert.propEqual(
			Array.from( getCachedMinHeights().keys() ),
			[ ".foo", ".bar", ".baz" ],
			"Doesn't rebuild cache on consecutive calls"
		);
	});

	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "getNeededColumns", function( assert ) {
		const { getNeededColumns } = this.subject;
		this.setCss( css`
			@media (max-width: 500px) and (min-width: 250px) { .foo { width: 50%; } }
			@media (max-width: 750px) and (min-width: 500px) { .foo { width: 33.333%; } }
			@media (min-width: 1000px) { .foo { width: 25%; } }
		` );

		assert.strictEqual( getNeededColumns( ".foo" ), 4, "4 columns at default width" );
		assert.strictEqual( getNeededColumns( ".foo", 1920 ), 4, "4 columns at 1920" );
		assert.strictEqual( getNeededColumns( ".foo", 1000 ), 4, "4 columns at 1000" );
		assert.strictEqual( getNeededColumns( ".foo", 999 ), 3, "3 columns at 999" );
		assert.strictEqual( getNeededColumns( ".foo", 500 ), 3, "3 columns at 500" );
		assert.strictEqual( getNeededColumns( ".foo", 499 ), 2, "2 columns at 499" );
		assert.strictEqual( getNeededColumns( ".foo", 250 ), 2, "2 columns at 250" );
		assert.strictEqual( getNeededColumns( ".foo", 249 ), 2, "2 columns at 249" );
		assert.throws( () => getNeededColumns( ".invalid", 1000 ), Error, "Invalid selector" );
	});

	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "getNeededRows", function( assert ) {
		const { getNeededRows } = this.subject;
		this.setCss( css`
			.foo, .bar { min-height: 100px; }
			.baz { min-height: 200px; }
		` );

		assert.throws( () => getNeededRows( ".invalid" ), Error, "Invalid selector" );

		this.querySelectorStub.returns({ clientHeight: 500 });
		assert.strictEqual( getNeededRows( ".foo" ), 6, "6 rows at 500" );
		assert.ok(
			this.querySelectorStub.calledOnceWithExactly( "body > .wrapper" ),
			"Default container"
		);
		this.querySelectorStub.reset();

		this.querySelectorStub.returns({ clientHeight: 750 });
		assert.strictEqual( getNeededRows( ".foo", ".qux" ), 9, "9 rows at 750" );
		assert.ok(
			this.querySelectorStub.calledOnceWithExactly( ".qux" ),
			"Custom container"
		);
		this.querySelectorStub.reset();

		this.querySelectorStub.returns( null );
		assert.strictEqual( getNeededRows( ".foo" ), 11, "11 100px rows at 1000" );
		assert.strictEqual( getNeededRows( ".baz" ), 6, "6 200px rows at 1000" );
	});
});

