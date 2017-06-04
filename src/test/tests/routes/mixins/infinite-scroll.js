import {
	module,
	test
} from "qunit";
import cssInfiniteScrollMixinInjector from "inject-loader!routes/mixins/infinite-scroll/css";


module( "routes/mixins/infinite-scroll" );


test( "CSS", assert => {

	assert.expect( 18 );

	const body = { clientHeight: 1000 };

	function inject( content, querySelector = () => {} ) {
		const styleNode = document.createElement( "style" );
		styleNode.innerText = content;
		document.head.appendChild( styleNode );

		const module = cssInfiniteScrollMixinInjector({
			"nwjs/Window": {
				window: {
					CSSMediaRule: window.CSSMediaRule,
					CSSStyleRule: window.CSSStyleRule,
					document: {
						styleSheets: [ styleNode.sheet ],
						querySelector,
						body
					}
				}
			}
		});

		document.head.removeChild( styleNode );

		return module;
	}

	try {
		const {
			cssMinWidthRules,
			cachedMinHeights
		} = inject( ".foo { color: red; }" );

		assert.propEqual( cssMinWidthRules, [], "Empty min width rules" );
		assert.propEqual( cachedMinHeights, {}, "Empty cached min heights" );
	} catch ( e ) {
		throw e;
	}

	try {
		const {
			cssMinWidthRules
		} = inject( `
			@media (max-width: 250px) { .foo { width: 100%; } }
			@media (max-width: 500px) and (min-width: 250px) { .foo { width: 50%; } }
			@media (max-width: 750px) and (min-width: 500px) { .foo { width: 33.333%; } }
			@media (min-width: 1000px) { .foo { width: 25%; } }
			@media (min-width: 1000px) {} }
		` );

		assert.propEqual(
			cssMinWidthRules.map( elem => elem.cssText.replace( /\s/g, "" ) ),
			[
				"@media(max-width:500px)and(min-width:250px){.foo{width:50%;}}",
				"@media(max-width:750px)and(min-width:500px){.foo{width:33.333%;}}",
				"@media(min-width:1000px){.foo{width:25%;}}"
			],
			"Finds all media rules containing min-width and optional max-width constraints"
		);
	} catch ( e ) {
		throw e;
	}

	try {
		const {
			cachedMinHeights
		} = inject( ".foo, .bar { min-height: 100px; } .baz { min-height: 200px; }" );

		assert.propEqual(
			cachedMinHeights,
			{
				".foo": 100,
				".bar": 100,
				".baz": 200
			},
			"Finds multiple min-height declarations"
		);
	} catch ( e ) {
		throw e;
	}

	try {
		const {
			getNeededColumns
		} = inject( `
			@media (max-width: 500px) and (min-width: 250px) { .foo { width: 50%; } }
			@media (max-width: 750px) and (min-width: 500px) { .foo { width: 33.333%; } }
			@media (min-width: 1000px) { .foo { width: 25%; } }
		` );

		assert.strictEqual( getNeededColumns( ".foo", 1920 ), 4, "4 columns at 1920" );
		assert.strictEqual( getNeededColumns( ".foo", 1000 ), 4, "4 columns at 1000" );
		assert.strictEqual( getNeededColumns( ".foo", 999 ), 3, "3 columns at 999" );
		assert.strictEqual( getNeededColumns( ".foo", 500 ), 3, "3 columns at 500" );
		assert.strictEqual( getNeededColumns( ".foo", 499 ), 2, "2 columns at 499" );
		assert.strictEqual( getNeededColumns( ".foo", 250 ), 2, "2 columns at 250" );
		assert.strictEqual( getNeededColumns( ".foo", 249 ), 2, "2 columns at 249" );
		assert.throws( () => getNeededColumns( ".bar", 1000 ), Error, "Invalid selector" );
	} catch ( e ) {
		throw e;
	}

	try {
		let calls = 0;
		const {
			getNeededRows
		} = inject(
			".foo, .bar { min-height: 100px; } .baz { min-height: 200px; }",
			selector => {
				switch ( ++calls ) {
					case 1:
						assert.strictEqual( selector, "body > .wrapper", "Default container" );
						return { clientHeight: 500 };
					case 2:
						assert.strictEqual( selector, ".qux", "Custom container" );
						return { clientHeight: 750 };
					case 3:
					case 4:
						return null;
				}
				throw new Error();
			}
		);

		assert.strictEqual( getNeededRows( ".foo" ), 6, "6 rows at 500" );
		assert.strictEqual( getNeededRows( ".foo", ".qux" ), 9, "9 rows at 750" );
		assert.strictEqual( getNeededRows( ".foo" ), 11, "11 100px rows at 1000" );
		assert.strictEqual( getNeededRows( ".baz" ), 6, "6 200px rows at 1000" );
	} catch ( e ) {
		throw e;
	}

});
