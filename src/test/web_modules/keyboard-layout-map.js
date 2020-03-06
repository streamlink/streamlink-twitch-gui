import sinon from "sinon";


/**
 * Fake US keyboard layout map (ignoring special keys, which are not used in tests)
 * @type {KeyboardLayoutMap}
 */
const defaultLayoutMap = new Map([
	// [ "Digit0", "0" ], ..., [ "Digit9", "9" ],
	...Array( 10 )
		.fill( 0 )
		.map( ( n, idx ) => String( n + idx ) )
		.map( s => ([ `Digit${s}`, s ]) ),
	// [ "KeyA", "a" ], ..., [ "KeyZ", "z" ],
	...Array( 26 )
		.fill( 97 )
		.map( ( n, idx ) => String.fromCharCode( n + idx ) )
		.map( s => ([ `Key${s.toUpperCase()}`, s ]) )
]);


/**
 * Stubs the KeyboardMap API and the "keyboard-layout-map" application initializer,
 * which is required by the HotkeyService and all modules using the HotkeyService
 * @param {NestedHooks} hooks
 * @param {KeyboardLayoutMap} layoutMap
 */
export function setupKeyboardLayoutMap( hooks, layoutMap = defaultLayoutMap ) {
	let getLayoutMapStub;

	hooks.before(function() {
		getLayoutMapStub = sinon.stub( navigator.keyboard, "getLayoutMap" ).resolves( layoutMap );
	});

	hooks.beforeEach(function() {
		this.owner.register( "keyboardlayoutmap:main", layoutMap, { instantiate: false } );
	});

	hooks.after(function() {
		getLayoutMapStub.restore();
	});
}
