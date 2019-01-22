import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver, triggerEventSync } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Service from "@ember/service";

import externalLinkComponentInjector
	from "inject-loader?-utils/getStreamFromUrl!ui/components/link/external-link/component";


module( "ui/components/link/external-link", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver()
	});

	hooks.beforeEach(function() {
		this.clipboardSetStub = sinon.stub();
		this.openBrowserStub = sinon.stub();
		this.contextMenuStub = sinon.stub();
		this.transitionToStub = sinon.stub();

		const { default: ExternalLinkComponent } = externalLinkComponentInjector({
			"nwjs/Clipboard": {
				set: this.clipboardSetStub
			},
			"nwjs/Shell": {
				openBrowser: this.openBrowserStub
			}
		});
		const NwjsService = Service.extend({
			contextMenu: this.contextMenuStub
		});
		const RouterService = Service.extend({
			transitionTo: this.transitionToStub
		});

		this.owner.register( "component:external-link", ExternalLinkComponent );
		this.owner.register( "service:nwjs", NwjsService );
		this.owner.register( "service:router", RouterService );
	});


	test( "Internal URL", async function( assert ) {
		let event;

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

		// trigger click event
		event = triggerEventSync( component, "click" );
		assert.ok( event.isDefaultPrevented(), "Default event action is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Event doesn't propagate" );
		assert.notOk( this.openBrowserStub.called, "Doesn't open browser" );
		assert.propEqual(
			this.transitionToStub.args,
			[ [ "channel", "foo" ] ],
			"Opens channel page"
		);

		// doesn't have a context menu
		event = triggerEventSync( component, "contextmenu" );
		assert.notOk( event.isDefaultPrevented(), "Default event action is not prevented" );
		assert.notOk( event.isImmediatePropagationStopped(), "Event propagates" );
		assert.notOk( this.contextMenuStub.called, "Doesn't open context menu" );
	});


	test( "External URL", async function( assert ) {
		let event;

		this.set( "url", "https://bar.com/" );
		this.set( "text", "foo" );
		await render( hbs`{{#external-link url=url}}{{text}}{{/external-link}}` );
		const component = this.element.querySelector( ".external-link-component" );

		assert.ok( component instanceof HTMLAnchorElement, "Component renders" );
		assert.strictEqual( component.innerText, "foo", "Component has the correct content" );
		assert.ok( component.classList.contains( "external-link" ), "Is an external link" );
		assert.strictEqual( component.title, "https://bar.com/", "Has a title" );
		assert.strictEqual( component.getAttribute( "href" ), "#", "Has the correct href attr" );

		// trigger click event
		event = triggerEventSync( component, "click" );
		assert.ok( event.isDefaultPrevented(), "Default event action is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Event doesn't propagate" );
		assert.propEqual( this.openBrowserStub.args, [ [ "https://bar.com/" ] ], "Opens browser" );
		assert.notOk( this.transitionToStub.called, "Does not transition to different route" );

		this.openBrowserStub.resetHistory();

		// has a context menu
		event = triggerEventSync( component, "contextmenu" );
		assert.ok( event.isDefaultPrevented(), "Default event action is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Event doesn't propagate" );
		assert.propEqual( this.contextMenuStub.args, [ [
			event,
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

		assert.notOk( this.openBrowserStub.called, "Browser hasn't been opened yet" );
		assert.notOk( this.clipboardSetStub.called, "Set clipboard hasn't been called yet" );

		this.contextMenuStub.args[0][1][0].click();
		assert.propEqual(
			this.openBrowserStub.args,
			[ [ "https://bar.com/" ] ],
			"Opens browser"
		);

		this.contextMenuStub.args[0][1][1].click();
		assert.propEqual(
			this.clipboardSetStub.args,
			[ [ "https://bar.com/" ] ],
			"Sets clipboard"
		);
	});

});
