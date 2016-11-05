import {} from "Shim";
import QUnit, {
	config,
	start
} from "QUnit";
import "EmberTest";
import "bower/qunit/qunit/qunit.css";
import "bower/ember/ember-template-compiler";


// don't start automatically
config.autostart = false;


function setupAndStart() {
	// set up the test reporter
	window.setupQUnit( QUnit );
	// make setup and start functions inaccessible
	window.setupQUnit = function() {};
	window.startQUnit = function() {};
	// then run all tests
	start();
}

window.startQUnit = function() {
	if ( window.setupQUnit ) {
		// QUnit test reporter setup has been injected
		setupAndStart();
	} else {
		// wait for the custom startQUnit call
		window.startQUnit = setupAndStart;
	}
};


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
	"tests/NumberFieldComponent",
	"tests/getStreamFromUrl"
], window.startQUnit );
