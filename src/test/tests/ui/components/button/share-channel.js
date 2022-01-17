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

import ShareChannelComponent from "ui/components/button/share-channel/component";
import TwitchUser from "data/models/twitch/user/model";
import HotkeyService from "services/hotkey";


module( "ui/components/button/share-channel", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyService,
			IntlService: FakeIntlService,
			SettingsService: Service.extend( Evented ),
			ShareChannelComponent,
			TwitchUser,
			TwitchChannel: Model.extend()
		})
	});

	setupKeyboardLayoutMap( hooks );

	/** @typedef {TestContext} TestContextUiComponentsButtonShareChannel */
	/** @this {TestContextUiComponentsButtonShareChannel} */
	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.setClipboardSpy = sinon.spy();
		this.owner.register( "service:nwjs", Service.extend({
			clipboard: {
				set: this.setClipboardSpy
			}
		}) );
	});


	/** @this {TestContextUiComponentsButtonShareChannel} */
	test( "ShareChannelComponent", async function( assert ) {
		/** @type {HotkeyService} */
		const hotkeyService = this.owner.lookup( "service:hotkey" );
		this.element.addEventListener( "keyup", e => hotkeyService.trigger( e ) );

		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		const user = store.createRecord( "twitch-user", {
			id: "123",
			login: "user"
		});
		this.setProperties({ user });

		await render( hbs`{{share-channel user=user}}` );
		const component = this.element.querySelector( ".share-channel-component" );

		assert.ok( component instanceof HTMLElement, "Renders the component" );
		assert.ok( component.classList.contains( "btn-info" ), "Is an info button" );
		assert.ok( component.querySelector( "i.fa-share-alt" ), "Has the share icon" );
		assert.strictEqual(
			component.getAttribute( "title" ),
			"[hotkeys.modifiers.ctrlKey+S] components.share-channel.title",
			"Has the correct title"
		);
		assert.notOk( this.setClipboardSpy.called, "Hasn't called clipboard.set yet" );

		await click( component );
		assert.propEqual(
			this.setClipboardSpy.args,
			[[ "https://twitch.tv/user" ]],
			"Has copied the channel URL to the clipboard by clicking the component"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyS", ctrlKey: true } );
		assert.propEqual(
			this.setClipboardSpy.args,
			[[ "https://twitch.tv/user" ]],
			"Has copied the channel URL to the clipboard by pressing the hotkey"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyS" } );
		assert.notOk( this.setClipboardSpy.called, "Doesn't react to different hotkeys" );
	});
});
