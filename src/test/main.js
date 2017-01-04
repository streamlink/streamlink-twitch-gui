import "Shim";
import QUnit, {
	config
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
	"tests/NumberFieldComponent",
	"tests/getStreamFromUrl",
	"tests/utils/node/resolvePath",
	"tests/utils/node/fs/stat",
	"tests/utils/node/fs/which",
	"tests/utils/node/fs/whichFallback"
], function() {
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
