import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import {
	stubDOMEvents,
	isDefaultPrevented,
	isImmediatePropagationStopped,
	triggerEvent
} from "event-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Service from "@ember/service";

import ExternalLinkComponent from "ui/components/link/external-link/component";


module( "ui/components/link/external-link", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			ExternalLinkComponent
		})
	});

	stubDOMEvents( hooks );

	hooks.beforeEach(function() {
		this.clipboardSetSpy = sinon.stub();
		this.openBrowserSpy = sinon.stub();
		this.contextMenuStub = sinon.stub();
		this.transitionToStub = sinon.stub();

		const NwjsService = Service.extend({
			contextMenu: this.contextMenuStub,
			openBrowser: this.openBrowserSpy,
			clipboard: {
				set: this.clipboardSetSpy
			}
		});
		const RouterService = Service.extend({
			transitionTo: this.transitionToStub
		});

		this.owner.register( "component:external-link", ExternalLinkComponent );
		this.owner.register( "service:nwjs", NwjsService );
		this.owner.register( "service:router", RouterService );
	});


	test( "Empty URL", async function( assert ) {
		let e;

		await render( hbs`{{#external-link url=null}}foo{{/external-link}}` );
		const component = this.element.querySelector( ".external-link-component" );

		assert.ok( component instanceof HTMLAnchorElement, "Component renders" );
		assert.strictEqual( component.innerText, "foo", "Component has the correct content" );
		assert.notOk( component.classList.contains( "external-link" ), "Empty URL" );
		assert.notOk( component.title, "Empty URLs don't have a title" );

		// trigger click event
		e = await triggerEvent( component, "click" );
		assert.ok( isDefaultPrevented( e ), "Default event action is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Event doesn't propagate" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );

		// doesn't have a context menu
		e = await triggerEvent( component, "contextmenu" );
		assert.notOk( isDefaultPrevented( e ), "Default event action is not prevented" );
		assert.notOk( isImmediatePropagationStopped( e ), "Event propagates" );
		assert.notOk( this.contextMenuStub.called, "Doesn't open context menu" );
	});

	test( "Internal URL", async function( assert ) {
		let e;

		this.set( "url", "https://twitch.tv/foo" );
		this.set( "text", "foo" );
		await render( hbs`{{#external-link url=url}}{{text}}{{/external-link}}` );
		const component = this.element.querySelector( ".external-link-component" );

		assert.ok( component instanceof HTMLAnchorElement, "Component renders" );
		assert.strictEqual( component.innerText, "foo", "Component has the correct content" );
		assert.notOk(
			component.classList.contains( "external-link" ),
			"Twitch channel links are internal"
		);
		assert.notOk( component.title, "Internal links don't have a title" );
		assert.strictEqual( component.getAttribute( "href" ), "#", "Has the correct href attr" );
		assert.strictEqual( component.tabIndex, -1, "TabIndex is set to -1" );

		// trigger click event
		e = await triggerEvent( component, "click" );
		assert.ok( isDefaultPrevented( e ), "Default event action is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Event doesn't propagate" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		assert.propEqual(
			this.transitionToStub.args,
			[ [ "channel", "foo" ] ],
			"Opens channel page"
		);

		// doesn't have a context menu
		e = await triggerEvent( component, "contextmenu" );
		assert.notOk( isDefaultPrevented( e ), "Default event action is not prevented" );
		assert.notOk( isImmediatePropagationStopped( e ), "Event propagates" );
		assert.notOk( this.contextMenuStub.called, "Doesn't open context menu" );
	});


	test( "External URL", async function( assert ) {
		let e;

		this.set( "url", "https://bar.com/" );
		this.set( "text", "foo" );
		await render( hbs`{{#external-link url=url}}{{text}}{{/external-link}}` );
		const component = this.element.querySelector( ".external-link-component" );

		assert.ok( component instanceof HTMLAnchorElement, "Component renders" );
		assert.strictEqual( component.innerText, "foo", "Component has the correct content" );
		assert.ok( component.classList.contains( "external-link" ), "Is an external link" );
		assert.strictEqual( component.title, "https://bar.com/", "Has a title" );
		assert.strictEqual( component.getAttribute( "href" ), "#", "Has the correct href attr" );
		assert.strictEqual( component.tabIndex, -1, "TabIndex is set to -1" );

		// trigger click event
		e = await triggerEvent( component, "click" );
		assert.ok( isDefaultPrevented( e ), "Default event action is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Event doesn't propagate" );
		assert.propEqual( this.openBrowserSpy.args, [ [ "https://bar.com/" ] ], "Opens browser" );
		assert.notOk( this.transitionToStub.called, "Does not transition to different route" );

		this.openBrowserSpy.resetHistory();

		// has a context menu
		e = await triggerEvent( component, "contextmenu" );
		assert.ok( isDefaultPrevented( e ), "Default event action is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Event doesn't propagate" );
		assert.propEqual( this.contextMenuStub.args, [ [
			e,
			[
				{
					label: [ "contextmenu.open-in-browser" ],
					click() {}
				},
				{
					label: [ "contextmenu.copy-link-address" ],
					click() {}
				}
			]
		] ], "Opens context menu" );

		assert.notOk( this.openBrowserSpy.called, "Browser hasn't been opened yet" );
		assert.notOk( this.clipboardSetSpy.called, "Set clipboard hasn't been called yet" );

		this.contextMenuStub.args[0][1][0].click();
		assert.propEqual(
			this.openBrowserSpy.args,
			[ [ "https://bar.com/" ] ],
			"Opens browser"
		);

		this.contextMenuStub.args[0][1][1].click();
		assert.propEqual(
			this.clipboardSetSpy.args,
			[ [ "https://bar.com/" ] ],
			"Sets clipboard"
		);
	});

});
