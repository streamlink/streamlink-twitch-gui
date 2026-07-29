import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";

import Service from "@ember/service";
import { EventEmitter } from "events";

import ThemeService from "services/theme";


module( "services/theme", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({})
	});

	class FakeMediaQueryList extends EventEmitter {
		constructor( matches ) {
			super();
			this.matches = matches;
		}
		addEventListener( ...args ) {
			return this.addListener( ...args );
		}
		removeEventListener( ...args ) {
			return this.removeListener( ...args );
		}
	}

	/** @typedef {TestContext} TestContextThemeService */
	/** @this {TestContextThemeService} */
	hooks.beforeEach(function() {
		this.matchMediaStub = sinon.stub();
		this.stubMatchMedia = arr => arr.map( ( matches, i ) => {
			const mql = new FakeMediaQueryList( matches );
			this.matchMediaStub.onCall( i ).callsFake( () => mql );

			return mql;
		});

		const tmpElem = document.createElement( "div" );
		this.getClassList = () => Array.from( tmpElem.classList.values() );
		tmpElem.classList.add( "foo" );

		this.owner.register( "service:-document", Service.extend({
			defaultView: {
				matchMedia: this.matchMediaStub
			},
			documentElement: {
				classList: tmpElem.classList
			}
		}) );
		this.owner.register( "service:settings", Service.extend({
			content: {
				gui: {
					theme: "system"
				}
			}
		}) );
	});


	/** @this {TestContextThemeService} */
	test( "Apply theme classes", async function( assert ) {
		this.owner.register( "service:theme", ThemeService.extend({
			_checkSystemColorScheme() {}
		}) );

		/** @type {SettingsService} */
		this.settings = this.owner.lookup( "service:settings" );
		/** @type {ThemeService} */
		this.theme = this.owner.lookup( "service:theme" );

		assert.notOk( this.theme.systemTheme, "systemTheme is unset initially" );
		assert.notOk( this.theme.customTheme, "customTheme is unset initially" );
		assert.propEqual( this.getClassList(), [ "foo" ], "No theme classes set initially" );

		this.set( "theme.systemTheme", "light" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-light" ], "Applies system theme" );

		this.set( "theme.systemTheme", "dark" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-dark" ], "Changes system theme" );

		this.set( "settings.content.gui.theme", "light" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-light" ], "Changes specific theme" );

		this.set( "settings.content.gui.theme", "dark" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-dark" ], "Changes specific theme" );

		this.set( "theme.systemTheme", "light" );
		this.set( "settings.content.gui.theme", "" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-light" ], "Sys theme if unset" );
		this.set( "settings.content.gui.theme", "unknown" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-light" ], "Sys theme if unknown" );

		this.set( "settings.content.gui.theme", "light" );
		this.theme.setTheme( "dark" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-dark" ], "Changes custom theme" );

		this.set( "settings.content.gui.theme", "" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-dark" ], "Keeps custom theme" );

		this.theme.setTheme( "invalid" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-light" ], "Invalid custom theme" );

		this.theme.setTheme( "" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-light" ], "No custom theme" );
	});

	/** @this {TestContextThemeService} */
	test( "System theme", async function( assert ) {
		this.owner.register( "service:theme", ThemeService.extend({
			_applyTheme: null
		}) );

		{
			this.matchMediaStub.callsFake( () => ({ matches: false }) );
			/** @type {ThemeService} */
			const theme = this.owner.lookup( "service:theme", { singleton: false } );
			theme.initialize();

			assert.strictEqual( theme.systemTheme, "light", "Sets to default if no query matches" );
			assert.propEqual(
				this.matchMediaStub.args,
				[
					[ "(prefers-color-scheme: no-preference)" ],
					[ "(prefers-color-scheme: light)" ],
					[ "(prefers-color-scheme: dark)" ]
				],
				"Queries all schemes"
			);

			this.matchMediaStub.reset();
		}

		{
			const mqls = this.stubMatchMedia([ false, false, true ]);
			/** @type {ThemeService} */
			const theme = this.owner.lookup( "service:theme", { singleton: false } );
			theme.initialize();

			assert.strictEqual( theme.systemTheme, "dark", "Sets theme to first matching query" );
			assert.propEqual(
				mqls.map( mql => mql.listenerCount( "change" ) ),
				[ 0, 0, 1 ],
				"Only the matching MediaQueryList has a change event listener attached"
			);

			const spy = sinon.spy( theme, "_checkSystemColorScheme" );
			mqls[0].emit( "change", { matches: true } );
			mqls[1].emit( "change", { matches: false } );
			mqls[2].emit( "change", { matches: true } );
			assert.notOk( spy.called, "Doesn't do anything if matching query still matches" );
			assert.strictEqual( theme.systemTheme, "dark", "Theme doesn't get changed" );

			this.matchMediaStub.reset();

			const mqlsNext = this.stubMatchMedia([ false, true, false ]);
			mqls[2].emit( "change", { matches: false } );
			assert.ok( spy.calledOnce, "Checks system color schemes again on change" );
			assert.propEqual(
				this.matchMediaStub.args,
				[
					[ "(prefers-color-scheme: no-preference)" ],
					[ "(prefers-color-scheme: light)" ]
				],
				"Queries schemes until the first one matches"
			);
			assert.propEqual(
				mqlsNext.map( mql => mql.listenerCount( "change" ) ),
				[ 0, 1, 0 ],
				"Only the matching MediaQueryList has a change event listener attached"
			);
			assert.strictEqual( theme.systemTheme, "light", "Updates the system theme on change" );

			spy.resetHistory();
			mqls[2].emit( "change", { matches: false } );
			assert.strictEqual(
				mqls[2].listenerCount( "change" ),
				0,
				"Removes event listener from old MediaQueryList"
			);
			assert.notOk( spy.called, "Does only react to changes once" );
		}
	});

	/** @this {TestContextThemeService} */
	test( "Acceptance test", async function( assert ) {
		this.owner.register( "service:theme", ThemeService );

		this.stubMatchMedia([ false, false, true ]);
		/** @type {ThemeService} */
		const theme = this.owner.lookup( "service:theme" );
		theme.initialize();

		assert.strictEqual( theme.systemTheme, "dark", "System theme is dark" );
		assert.propEqual( this.getClassList(), [ "foo", "theme-dark" ], "Sets system theme class" );
	});
});
