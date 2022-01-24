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

import OpenChatComponent from "ui/components/button/open-chat/component";
import TwitchUser from "data/models/twitch/user/model";
import HotkeyService from "services/hotkey";


module( "ui/components/button/open-chat", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyService,
			IntlService: FakeIntlService,
			SettingsService: Service.extend( Evented ),
			OpenChatComponent,
			TwitchUser,
			TwitchChannel: Model.extend()
		})
	});

	setupKeyboardLayoutMap( hooks );

	/** @typedef {TestContext} TestContextUiComponentsButtonOpenChat */
	/** @this {TestContextUiComponentsButtonOpenChat} */
	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.openChatSpy = sinon.spy();
		this.owner.register( "service:chat", Service.extend({
			openChat: this.openChatSpy
		}) );
	});


	/** @this {TestContextUiComponentsButtonOpenChat} */
	test( "OpenChatComponent", async function( assert ) {
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

		await render( hbs`{{open-chat user=user}}` );
		const component = this.element.querySelector( ".open-chat-component" );

		assert.ok( component instanceof HTMLElement, "Renders the component" );
		assert.ok( component.classList.contains( "btn-hint" ), "Is a hint button" );
		assert.ok( component.querySelector( "i.fa-comments" ), "Has the comments icon" );
		assert.strictEqual(
			component.getAttribute( "title" ),
			"[hotkeys.modifiers.ctrlKey+C] components.open-chat.title",
			"Has the correct title"
		);
		assert.notOk( this.openChatSpy.called, "Hasn't called openChat yet" );

		await click( component );
		assert.ok(
			this.openChatSpy.calledOnceWithExactly( "user" ),
			"Has called openChat by clicking the component"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyC", ctrlKey: true } );
		assert.ok(
			this.openChatSpy.calledOnceWithExactly( "user" ),
			"Has called openChat by pressing the hotkey"
		);
		sinon.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyC" } );
		assert.notOk( this.openChatSpy.called, "Doesn't react to different hotkeys" );
	});
});
