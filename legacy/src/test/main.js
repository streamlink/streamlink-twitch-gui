// special NW.js package.json import (see webpack config)
import "./package.json";

import QUnit from "qunit";
import "qunit/assertion-helpers";
import "./web_modules/ember-test";


const { config } = QUnit;

// don't start automatically
config.autostart = false;

// urlParams
// TODO: fix this once QUnit implements default config values instead of forced overrides

// hide passed tests
config.hidepassed = true;
// check for pollution of the global scope (window)
config.noglobals = true;


// load tests and then start
require( [ "tests" ], /* istanbul ignore next */ function() {
	if ( global._noQUnitBridge ) {
		// fix broken "Rerun" anchor on completed tests
		document.documentElement.addEventListener( "click", function( ev ) {
			if ( ev.target instanceof HTMLAnchorElement && ev.target.closest( "#qunit-tests" ) ) {
				ev.stopImmediatePropagation();
				document.location.href = ev.target.href;
			}
		}, { capture: true } );

		return QUnit.start();
	}

	if ( typeof global._setupQUnitBridge === "function" ) {
		// bridge injected, set it up and start QUnit
		global._setupQUnitBridge( QUnit );
	} else {
		// bridge not injected yet
		// remember QUnit reference so it can setup/start QUnit by itself once it gets injected
		global._setupQUnitBridge = QUnit;
	}
});
