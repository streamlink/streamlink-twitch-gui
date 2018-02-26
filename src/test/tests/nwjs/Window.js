import { module, test } from "qunit";
import { EventEmitter } from "events";

import nwWindowInjector from "inject-loader!nwjs/Window";


class Window extends EventEmitter {
	constructor() {
		super();
		[
			"focus",
			"blur",
			"maximize",
			"minimize",
			"restore"
		].forEach( event => {
			this[ event ] = () => this.emit( event );
		});
	}
}


module( "nwjs/Window" );


test( "Window", async assert => {

	assert.expect( 32 );

	const {
		default: nwWindow,
		getFocused,
		setFocused,
		getVisibility,
		setVisibility,
		toggleVisibility,
		getMaximized,
		setMaximized,
		toggleMaximized,
		getMinimized,
		setMinimized,
		toggleMinimized,
		setShowInTaskbar
	} = nwWindowInjector({
		"nwjs/App": {
			manifest: {
				window: {
					show: false
				}
			}
		},
		"nwjs/nwGui": {
			Window: {
				get: () => new class extends Window {
					removeAllListeners( ...args ) {
						assert.propEqual( args, [], "Calls removeAllListeners()" );
						return super.removeAllListeners( ...args );
					}
					setShowInTaskbar( bool ) {
						assert.strictEqual( bool, true, "Calls setShowInTaskbar()" );
					}
					show() {}
					hide() {}
 				}()
			}
		}
	});

	assert.ok( getFocused(), "Is focused initially" );
	assert.ok( !getVisibility(), "Is not visible initially" );
	assert.ok( !getMaximized(), "Is not maximized initially" );
	assert.ok( !getMinimized(), "Is not minimized initially" );

	nwWindow.emit( "new-win-policy", null, null, {
		ignore() {
			assert.ok( true, "Ignores new window policy requests" );
		}
	});

	nwWindow.emit( "navigation", null, null, {
		ignore() {
			assert.ok( true, "Ignores navigation requests" );
		}
	});

	setShowInTaskbar( true );

	setFocused( false );
	assert.ok( !getFocused(), "Is not focused after calling setFocused( false )" );
	setFocused( true );
	assert.ok( getFocused(), "Is focused again after calling setFocused( true )" );
	nwWindow.emit( "blur" );
	assert.ok( !getFocused(), "Is not focused after emitting blur" );
	nwWindow.emit( "focus" );
	assert.ok( getFocused(), "Is focused again after emitting focus" );

	setVisibility( false );
	assert.ok( !getVisibility(), "Is not visible after calling setVisibility( false )" );
	setVisibility( true );
	assert.ok( getVisibility(), "Is visible after calling setVisibility( true )" );

	setMaximized( true );
	assert.ok( getMaximized(), "Is maximized after calling setMaximized( true )" );
	setMaximized( false );
	assert.ok( !getMaximized(), "Is not maximized after calling setMaximized( false )" );
	nwWindow.emit( "maximize" );
	assert.ok( getMaximized(), "Is maximized after emitting maximize" );
	nwWindow.emit( "restore" );
	assert.ok( !getMaximized(), "Is not maximized after emitting restore" );

	setMinimized( true );
	assert.ok( getMinimized(), "Is minimized after calling setMinimized( true )" );
	setMinimized( false );
	assert.ok( !getMinimized(), "Is not minimized after calling setMinimized( false )" );
	nwWindow.emit( "minimize" );
	assert.ok( getMinimized(), "Is minimized after emitting minimize" );
	nwWindow.emit( "restore" );
	assert.ok( !getMinimized(), "Is not minimized after emitting restore" );

	setMaximized( true );
	setMinimized( true );
	assert.ok( getMaximized() && getMinimized(), "Is maximized and minimized" );
	nwWindow.emit( "restore" );
	assert.ok( getMaximized() && !getMinimized(), "Is maximized but not minimized" );
	nwWindow.emit( "restore" );
	assert.ok( !getMaximized() && !getMinimized(), "Is neither maximized nor minimized" );

	toggleVisibility();
	assert.ok( !getVisibility(), "Is not visible after calling toggleVisibility()" );
	toggleVisibility();
	assert.ok( getVisibility(), "Is visible after calling toggleVisibility() again" );

	toggleMaximized();
	assert.ok( getMaximized(), "Is maximized after calling toggleMaximize()" );
	toggleMaximized();
	assert.ok( !getMaximized(), "Is not maximized after calling toggleMaximize() again" );

	toggleMinimized();
	assert.ok( getMinimized(), "Is minimized after calling toggleMinimize()" );
	toggleMinimized();
	assert.ok( !getMinimized(), "Is not minimized after calling toggleMinimize() again" );


	// don't unnecessarily call show, hide, restore, maximize and minimize

	const throwError = () => { throw new Error(); };
	const { show, hide, restore, maximize, minimize } = nwWindow;

	nwWindow.show = throwError;
	setVisibility( true );
	nwWindow.show = show;
	setVisibility( false );
	nwWindow.hide = throwError;
	setVisibility( false );
	nwWindow.hide = hide;

	nwWindow.restore = throwError;
	setMaximized( false );
	setMinimized( false );
	nwWindow.restore = restore;

	setMaximized( true );
	setMinimized( true );
	nwWindow.maximize = throwError;
	nwWindow.minimize = throwError;
	setMaximized( true );
	setMinimized( true );
	nwWindow.maximize = maximize;
	nwWindow.minimize = minimize;


	const { getVisibility: getVisibility2 } = nwWindowInjector({
		"nwjs/App": {
			manifest: {
				window: {
					show: true
				}
			}
		},
		"nwjs/nwGui": {
			Window: {
				get: () => new Window()
			}
		}
	});

	assert.ok( getVisibility2(), "Is visible initially if set in app manifest" );

});
