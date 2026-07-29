window.EmberENV = Object.assign( window.EmberENV || {}, {
	_JQUERY_INTEGRATION: false,
	EXTEND_PROTOTYPES: {
		// TODO: disable Array.prototype extensions
		Array: true,
		Date: false,
		// TODO: disable Function.prototype extensions
		Function: true,
		String: false
	}
});


// use a require call here, since EmberENV needs to be defined first
require( "ember-source/dist/ember.debug" );
const { Ember } = window;


// some Ember addons rely on Ember's RequireJS methods on the global window context
window.requirejs = {
	entries: Ember.__loader.registry
};
window.requireModule = Ember.__loader.require;


// Remove unused deprecated prototype extensions which can't be disabled as a whole.
// Sinon will access all properties on the global class prototypes and cause a deprecation warning.
for ( const [ proto, props ] of new Map([
	[ Array.prototype, [ "@each" ] ]
]) ) {
	for ( const prop of props ) {
		Object.defineProperty( proto, prop, {
			enumerable: false,
			configurable: false,
			writable: false,
			value: null
		});
	}
}


export default Ember;
