import { module, test } from "qunit";
import sinon from "sinon";

import { EventEmitter } from "events";

import nwWindowInjector from "inject-loader!nwjs/Window";


module( "nwjs/Window", function( hooks ) {
	const events = [
		"focus",
		"blur",
		"maximize",
		"minimize",
		"restore"
	];

	hooks.beforeEach(function() {
		const removeAllListenersSpy = this.removeAllListenersSpy = sinon.spy();
		const setShowInTaskbarSpy = this.setShowInTaskbarSpy = sinon.spy();
		const showSpy = this.showSpy = sinon.spy();
		const hideSpy = this.hideSpy = sinon.spy();

		class Window extends EventEmitter {
			constructor() {
				super();
				for ( const event of events ) {
					this[ event ] = () => this.emit( event );
				}
			}

			removeAllListeners = removeAllListenersSpy;
			setShowInTaskbar = setShowInTaskbarSpy;
			show = showSpy;
			hide = hideSpy;
		}

		const nwWindow = new Window();

		this.injector = nwWindowInjector({
			"nwjs/App": {
				manifest: {
					window: {
						show: false,
						show_in_taskbar: false
					}
				}
			},
			"nwjs/nwGui": {
				Window: {
					get: () => nwWindow
				}
			}
		});
	});


	test( "nwWindow", function( assert ) {
		const { default: nwWindow } = this.injector;

		assert.ok( this.removeAllListenersSpy.calledOnce, "Initially calls removeAllListeners()" );

		const policy = {
			ignore() {}
		};
		const ignorePolicySpy = sinon.spy( policy, "ignore" );

		nwWindow.emit( "new-win-policy", null, null, policy );
		assert.ok( ignorePolicySpy.calledOnce, "Ignores new window policy requests" );
		ignorePolicySpy.resetHistory();

		nwWindow.emit( "navigation", null, null, policy );
		assert.ok( ignorePolicySpy.calledOnce, "Ignores navigation requests" );
		ignorePolicySpy.resetHistory();
	});


	test( "Visibility", function( assert ) {
		const { getVisibility, setVisibility, toggleVisibility } = this.injector;

		assert.notOk( getVisibility(), "Is not visible initially" );

		setVisibility( true );
		assert.ok( getVisibility(), "Is visible now" );
		assert.ok( this.showSpy.calledOnce, "Calls nwWindow.show()" );
		setVisibility( true );
		assert.ok( getVisibility(), "Is still visible" );
		assert.ok( this.showSpy.calledOnce, "Only calls nwWindow.show() once" );

		setVisibility( false );
		assert.notOk( getVisibility(), "Not visible again" );
		assert.ok( this.hideSpy.calledOnce, "Calls nwWindow.hide()" );
		setVisibility( false );
		assert.notOk( getVisibility(), "Still not visible" );
		assert.ok( this.hideSpy.calledOnce, "Only calls nwWindow.hide() once" );

		toggleVisibility();
		assert.ok( getVisibility(), "Is visible after toggling" );
		toggleVisibility();
		assert.notOk( getVisibility(), "Is not visible after toggling again" );
	});


	test( "Maximized / minimized", function( assert ) {
		const { default: nwWindow } = this.injector;
		const { getMaximized, setMaximized, toggleMaximized } = this.injector;
		const { getMinimized, setMinimized, toggleMinimized } = this.injector;

		assert.notOk( getMaximized(), "Not maximized initially" );
		assert.notOk( getMinimized(), "Not minimized initially" );

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

		toggleMaximized();
		assert.ok( getMaximized(), "Is maximized after calling toggleMaximize()" );
		toggleMaximized();
		assert.ok( !getMaximized(), "Is not maximized after calling toggleMaximize() again" );

		toggleMinimized();
		assert.ok( getMinimized(), "Is minimized after calling toggleMinimize()" );
		toggleMinimized();
		assert.ok( !getMinimized(), "Is not minimized after calling toggleMinimize() again" );

		const restoreSpy = sinon.spy( nwWindow, "restore" );
		setMaximized( false );
		setMinimized( false );
		assert.notOk( restoreSpy.called, "Doesn't unnecessarily call restore" );

		setMaximized( true );
		setMinimized( true );
		const maximizeSpy = sinon.spy( nwWindow, "maximize" );
		const minimizeSpy = sinon.spy( nwWindow, "minimize" );
		setMaximized( true );
		setMinimized( true );
		assert.notOk( maximizeSpy.called, "Doesn't unnecessarily call maximize" );
		assert.notOk( minimizeSpy.called, "Doesn't unnecessarily call minimize" );
	});


	test( "Focus", function( assert ) {
		const { getFocused, setFocused } = this.injector;

		assert.ok( getFocused(), "Is focused initially" );

		setFocused( false );
		assert.notOk( getFocused(), "Not focused anymore" );

		setFocused( true );
		assert.ok( getFocused(), "Focused again" );
	});


	test( "Taskbar", function( assert ) {
		const { getShowInTaskbar, setShowInTaskbar, toggleShowInTaskbar } = this.injector;

		assert.notOk( getShowInTaskbar(), "Not shown in taskbar initially" );

		setShowInTaskbar( true );
		assert.ok( getShowInTaskbar(), "Now shown in taskbar" );
		assert.ok(
			this.setShowInTaskbarSpy.calledWithExactly( true ),
			"Calls nwWindow.setShowInTaskBar(true)"
		);
		this.setShowInTaskbarSpy.resetHistory();

		setShowInTaskbar( false );
		assert.notOk( getShowInTaskbar(), "Not shown in taskbar anymore" );
		assert.ok(
			this.setShowInTaskbarSpy.calledWithExactly( false ),
			"Calls nwWindow.setShowInTaskBar(false)"
		);
		this.setShowInTaskbarSpy.resetHistory();

		toggleShowInTaskbar();
		assert.ok( getShowInTaskbar(), "Shown in taskbar after toggling" );
		toggleShowInTaskbar();
		assert.notOk( getShowInTaskbar(), "Not shown in taskbar after toggling again" );
	});
});
