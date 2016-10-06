import {
	config,
	start
} from "QUnit";
import "EmberTest";
import "bower/qunit/qunit/qunit.css";
import "bower/ember/ember-template-compiler";


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
	"tests/InfiniteScrollComponent",
	"tests/InputBtnComponent",
	"tests/getStreamFromUrl"
], start );
