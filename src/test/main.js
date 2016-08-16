define([
	"QUnit",
	"EmberTest",
	"vendor/qunit/qunit/qunit.css"
], function(
	QUnit
) {

	// don't start automatically
	QUnit.config.autostart = false;

	// load tests and then start
	require([
		"vendor/ember/ember-template-compiler",

		"tests/semver",
		"tests/linkparser",
		"tests/helpers",
		"tests/parameters",
		"tests/ObjectBuffer",
		"tests/StreamOutputBuffer",
		"tests/ContentListComponent",
		"tests/InputBtnComponent",
		"tests/getStreamFromUrl"
	], QUnit.start );

});
