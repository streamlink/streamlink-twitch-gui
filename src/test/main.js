import QUnit from "QUnit";
import {} from "EmberTest";
import {} from "vendor/qunit/qunit/qunit.css";
import {} from "vendor/ember/ember-template-compiler";


	// don't start automatically
	QUnit.config.autostart = false;

	// load tests and then start
	require([
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
