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
		this.querySelectorStub = sinon.stub();

		this.getModule = cssContent => {
			const styleNode = document.createElement( "style" );
			styleNode.innerText = cssContent;
			document.head.appendChild( styleNode );

			const module = infiniteScrollMixinCssInjector({
				"nwjs/Window": {
					window: {
						CSSMediaRule: window.CSSMediaRule,
						CSSStyleRule: window.CSSStyleRule,
						innerWidth: 1000,
						document: {
							styleSheets: [ styleNode.sheet ],
							querySelector: this.querySelectorStub,
							body: { clientHeight: 1000 }
						}
					}
				}
			});

			document.head.removeChild( styleNode );

			return module;
		};
	});


	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "Empty media rules", function( assert ) {
		const { cssMinWidthRules, cachedMinHeights } = this.getModule( css`
			.foo { color: red; }
		` );

		assert.propEqual( cssMinWidthRules, [], "Empty min width rules" );
		assert.propEqual( cachedMinHeights, {}, "Empty cached min heights" );
	});

	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "cssMinWidthRules", function( assert ) {
		const { cssMinWidthRules } = this.getModule( css`
			/* max only */
			@media (max-width: 250px) { .foo { width: 100%; } }
			/* max first, min second */
			@media (max-width: 500px) and (min-width: 250px) { .foo { width: 50%; } }
			/* min first, max second */
			@media (min-width: 500px) and (max-width: 750px) { .foo { width: 33.333%; } }
			/* min only */
			@media (min-width: 1000px) { .foo { width: 25%; } }
			/* empty */
			@media (min-width: 1000px) {}
		` );

		assert.propEqual(
			cssMinWidthRules.map( elem => elem.cssText.replace( /\s/g, "" ) ),
			[
				"@media(max-width:500px)and(min-width:250px){.foo{width:50%;}}",
				"@media(min-width:500px)and(max-width:750px){.foo{width:33.333%;}}",
				"@media(min-width:1000px){.foo{width:25%;}}"
			],
			"Finds all media rules containing min-width and optional max-width constraints"
		);
	});

	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "cachedMinHeights", function( assert ) {
		const { cachedMinHeights } = this.getModule( css`
			.foo, .bar { min-height: 100px; }
			.baz { min-height: 200px; }
		` );

		assert.propEqual(
			cachedMinHeights,
			{
				".foo": 100,
				".bar": 100,
				".baz": 200
			},
			"Finds multiple min-height declarations"
		);
	});

	/** @this {TestContextInfiniteScrollMixinCss} */
	test( "getNeededColumns", function( assert ) {
		const { getNeededColumns } = this.getModule( css`
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
		const { getNeededRows } = this.getModule( css`
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

