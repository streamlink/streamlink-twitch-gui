// special NW.js package.json import (see webpack config)
import "./package.json";

import QUnit from "qunit";
import "qunit/assertion-helpers";
import "./web_modules/ember-test";


// TODO: fix QUnit's urlParams / broken checkbox states
const { config } = QUnit;


// don't start automatically
config.autostart = false;
// check for pollution of the global scope (window)
config.noglobals = true;
// hide passed tests
config.hidepassed = true;


// load tests and then start
require( [ "tests" ], /* istanbul ignore next */ function() {
	if ( global._noQUnitBridge ) {
		return QUnit.start();
	}
	if ( global._setupQUnitBridge ) {
		// bridge injected, set it up and start QUnit
		global._setupQUnitBridge( QUnit );
	} else {
		// bridge not injected yet
		// remember QUnit reference so it can setup/start QUnit by itself once it gets injected
		global._setupQUnitBridge = QUnit;
	}
});
