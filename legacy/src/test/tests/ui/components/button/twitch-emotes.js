import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import { setupKeyboardLayoutMap } from "keyboard-layout-map";
import { triggerEvent } from "event-utils";
import { render, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import { set } from "@ember/object";
import Evented from "@ember/object/evented";
import { run } from "@ember/runloop";
import Service from "@ember/service";
import Model from "ember-data/model";

import TwitchEmotesComponent from "ui/components/button/twitch-emotes/component";
import TwitchUser from "data/models/twitch/user/model";
import HotkeyService from "services/hotkey";


module( "ui/components/button/twitch-emotes", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyService,
			IntlService: FakeIntlService,
			TwitchEmotesComponent,
			TwitchUser,
			TwitchChannel: Model.extend()
		})
	});

	setupKeyboardLayoutMap( hooks );

	/** @typedef {TestContext} TestContextUiComponentsButtonTwitchEmotes */
	/** @this {TestContextUiComponentsButtonTwitchEmotes} */
	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.openBrowserSpy = sinon.spy();
		this.owner.register( "service:nwjs", Service.extend({
			openBrowser: this.openBrowserSpy
		}) );
		this.owner.register( "service:settings", Service.extend( Evented, {
			content: {
				streams: {
					twitchemotes: true
				}
			}
		}) );
	});


	/** @this {TestContextUiComponentsButtonTwitchEmotes} */
	test( "TwitchEmotesComponent", async function( assert ) {
		/** @type {SettingsService} */
		const settingsService = this.owner.lookup( "service:settings" );
		/** @type {HotkeyService} */
		const hotkeyService = this.owner.lookup( "service:hotkey" );
		this.element.addEventListener( "keyup", e => hotkeyService.trigger( e ) );

		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		const user = store.createRecord( "twitch-user", {
			id: "123",
			login: "user",
			broadcaster_type: "partner"
		});
		this.setProperties({
			user,
			showButton: true
		});

		await render( hbs`{{twitch-emotes user=user showButton=showButton}}` );
		const component = this.element.querySelector( ".twitch-emotes-component" );

		assert.ok( component instanceof HTMLElement, "Renders the component" );
		assert.ok( component.classList.contains( "btn-neutral" ), "Is a neutral button" );
		assert.ok( component.querySelector( "i.fa-smile-o" ), "Has the smile-o icon" );
		assert.strictEqual(
			component.getAttribute( "title" ),
			"[hotkeys.modifiers.ctrlKey+E] components.twitch-emotes.title",
			"Has the correct title"
		);
		assert.notStrictEqual(
			window.getComputedStyle( component ).display,
			"Doesn't hide the component"
		);
		assert.notOk( this.openBrowserSpy.called, "Hasn't called openBrowser yet" );

		await click( component );
		assert.propEqual(
			this.openBrowserSpy.args,
			[[ "https://twitchemotes.com/channels/{id}", { id: "123" } ]],
			"Has opened the twitchemotes.com URL in the web browser by clicking the component"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyE", ctrlKey: true } );
		assert.propEqual(
			this.openBrowserSpy.args,
			[[ "https://twitchemotes.com/channels/{id}", { id: "123" } ]],
			"Has opened the twitchemotes.com URL in the web browser by pressing the hotkey"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyE" } );
		assert.notOk( this.openBrowserSpy.called, "Doesn't react to different hotkeys" );

		run( () => set( settingsService, "content.streams.twitchemotes", false ) );
		assert.notStrictEqual(
			window.getComputedStyle( component ).display,
			"Doesn't hide the component if disabled via settings but enforced via showButton"
		);

		run( () => set( this, "showButton", false ) );
		assert.strictEqual(
			window.getComputedStyle( component ).display,
			"none",
			"Hides the component if disabled"
		);

		run( () => {
			set( this, "showButton", true );
			set( user, "broadcaster_type", "" );
		});
		assert.strictEqual(
			window.getComputedStyle( component ).display,
			"none",
			"Hides the component if channel is not partnered"
		);
	});
});
