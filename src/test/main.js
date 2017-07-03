import "shim";
import QUnit, {
	config
} from "qunit";
import "ember-test";
import "bower/ember/ember-template-compiler";


// don't start automatically
config.autostart = false;
// check for pollution of the global scope (window)
config.noglobals = true;
// hide passed tests
config.hidepassed = true;


// load tests and then start
require( [ "tests/tests" ], function() {
	if ( global._noQUnitBridge ) { return; }
	if ( global._setupQUnitBridge ) {
		// bridge injected, set it up and start QUnit
		global._setupQUnitBridge( QUnit );
	} else {
		// bridge not injected yet
		// remember QUnit reference so it can setup/start QUnit by itself once it gets injected
		global._setupQUnitBridge = QUnit;
	}
});
