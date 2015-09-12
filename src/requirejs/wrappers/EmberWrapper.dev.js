define( [ "Ember", "EmberHtmlbars" ], function( Ember ) {

	// fix ember 1.13.x
	// https://github.com/emberjs/ember.js/issues/11679
	window.process = window._process;
	delete window._process;

	return Ember;
});
