window.EmberENV = Object.assign( window.EmberENV || {}, {
	_JQUERY_INTEGRATION: false
});


// use a require call here, since EmberENV needs to be defined first
require( "ember-source/dist/ember.debug" );
const { Ember } = window;


// some Ember addons rely on Ember's RequireJS methods on the global window context
window.requirejs = {
	entries: Ember.__loader.registry
};
window.requireModule = Ember.__loader.require;

// polyfill Ember's native decorators
require( "ember-decorators-polyfill/vendor/ember-decorators-polyfill" );


export default Ember;
