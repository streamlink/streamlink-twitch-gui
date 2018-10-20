import "ember-source/dist/ember.debug";


// some Ember addons rely on Ember's RequireJS methods on the global window context
window.requirejs = {
	entries: window.Ember.__loader.registry
};
window.requireModule = window.Ember.__loader.require;

// make sure EmberENV exists
window.EmberENV = window.Ember.ENV || {};


export default window.Ember;
