import {} from "Shim";
import {
	config,
	start
} from "QUnit";
import {} from "EmberTest";
import {} from "vendor/qunit/qunit/qunit.css";
import {} from "vendor/ember/ember-template-compiler";


// don't start automatically
config.autostart = false;

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
	"tests/NumberFieldComponent",
	"tests/getStreamFromUrl"
], start );
