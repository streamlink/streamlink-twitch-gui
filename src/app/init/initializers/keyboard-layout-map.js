/**
 * @typedef {Map<string, string>} KeyboardLayoutMap
 */
/**
 * @function navigator.keyboard.getLayoutMap
 * @returns Promise<KeyboardLayoutMap>
 */


export default {
	name: "keyboard-layout-map",

	/** @param {Ember.Application} application */
	initialize( application ) {
		application.deferReadiness();

		Promise.resolve()
			.then( () => navigator.keyboard.getLayoutMap() )
			.catch( () => new Map() )
			.then( /** @param {KeyboardLayoutMap} layoutMap */ layoutMap => {
				application.register( "keyboardlayoutmap:main", layoutMap, { instantiate: false } );
				application.advanceReadiness();
			});
	}
};
