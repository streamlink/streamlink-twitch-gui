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

import Evented from "@ember/object/evented";
import Service from "@ember/service";
import Model from "ember-data/model";

import ChannelButtonComponent from "ui/components/button/channel-button/component";
import TwitchUser from "data/models/twitch/user/model";
import HotkeyService from "services/hotkey";


module( "ui/components/button/channel-button", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyService,
			IntlService: FakeIntlService,
			SettingsService: Service.extend( Evented ),
			ChannelButtonComponent,
			TwitchUser,
			TwitchChannel: Model.extend()
		})
	});

	setupKeyboardLayoutMap( hooks );

	/** @typedef {TestContext} TestContextUiComponentsButtonChannelButton */
	/** @this {TestContextUiComponentsButtonChannelButton} */
	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.openBrowserSpy = sinon.spy();
		this.owner.register( "service:nwjs", Service.extend({
			openBrowser: this.openBrowserSpy
		}) );
	});


	/** @this {TestContextUiComponentsButtonChannelButton} */
	test( "ChannelButtonComponent", async function( assert ) {
		/** @type {HotkeyService} */
		const hotkeyService = this.owner.lookup( "service:hotkey" );
		this.element.addEventListener( "keyup", e => hotkeyService.trigger( e ) );

		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		const user = store.createRecord( "twitch-user", {
			id: "123",
			login: "user",
			display_name: "User"
		});
		this.setProperties({ user });

		await render( hbs`{{channel-button user=user}}` );
		const component = this.element.querySelector( ".channel-button-component" );

		assert.ok( component instanceof HTMLElement, "Renders the component" );
		assert.ok( component.classList.contains( "btn-primary" ), "Is a primary button" );
		assert.ok( component.querySelector( "i.fa-twitch" ), "Has the twitch icon" );
		assert.strictEqual(
			component.getAttribute( "title" ),
			"[hotkeys.modifiers.ctrlKey+F] components.channel-button.title{\"name\":\"User\"}",
			"Has the correct title"
		);
		assert.notOk( this.openBrowserSpy.called, "Hasn't called openBrowser yet" );

		await click( component );
		assert.propEqual(
			this.openBrowserSpy.args,
			[[ "https://twitch.tv/{channel}", { channel: "user" } ]],
			"Has opened the channel URL in the web browser by clicking the component"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyF", ctrlKey: true } );
		assert.propEqual(
			this.openBrowserSpy.args,
			[[ "https://twitch.tv/{channel}", { channel: "user" } ]],
			"Has opened the channel URL in the web browser by pressing the hotkey"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyF" } );
		assert.notOk( this.openBrowserSpy.called, "Doesn't react to different hotkeys" );
	});
});
