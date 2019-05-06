import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { triggerEvent } from "event-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Service from "@ember/service";

import EmbeddedHtmlLinksComponent from "ui/components/link/embedded-html-links/component";


module( "ui/components/link/embedded-html-links", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver()
	});

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

		this.owner.register( "component:embedded-html-links", EmbeddedHtmlLinksComponent );
		this.owner.register( "service:nwjs", NwjsService );
		this.owner.register( "service:router", RouterService );
	});


	test( "EmbeddedHtmlLinksComponent", async function( assert ) {
		let event;

		await render( hbs`
			{{~#embedded-html-links~}}
				<a href="https://twitch.tv/foo">foo</a><br>
				<a href="https://bar.com/">bar.com</a>
			{{~/embedded-html-links~}}
		` );

		const [ anchorOne, anchorTwo ] = this.element.querySelectorAll( "a" );

		assert.notOk(
			anchorOne.classList.contains( "external-link" ),
			"First link is not external"
		);
		assert.strictEqual(
			anchorOne.title,
			"",
			"First link doesn't have a title property"
		);
		assert.ok(
			anchorTwo.classList.contains( "external-link" ),
			"Second link is external"
		);
		assert.strictEqual(
			anchorTwo.title,
			"https://bar.com/",
			"Second link has a title property"
		);

		// anchor 1
		// left click
		event = await triggerEvent( anchorOne, "click", { button: 0 } );
		assert.ok( event.isDefaultPrevented(), "Left click: default event is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Left click: event doesn't propagate" );
		assert.propEqual(
			this.transitionToStub.args,
			[ [ "channel", "foo" ] ],
			"Opens channel page"
		);
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		this.transitionToStub.resetHistory();
		// middle click
		event = await triggerEvent( anchorOne, "click", { button: 1 } );
		assert.ok( event.isDefaultPrevented(), "Middle click: default event is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Middle click: event doesn't propagate" );
		assert.propEqual(
			this.transitionToStub.args,
			[ [ "channel", "foo" ] ],
			"Opens channel page"
		);
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		this.transitionToStub.resetHistory();
		// right click (doesn't execute transition)
		event = await triggerEvent( anchorOne, "click", { button: 2 } );
		assert.ok( event.isDefaultPrevented(), "Right click: default event is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Right click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't open channel page on non-left-click" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		// doesn't have a context menu
		event = await triggerEvent( anchorOne, "contextmenu" );
		assert.notOk( event.isDefaultPrevented(), "Contextmenu: default event is not prevented" );
		assert.notOk( event.isImmediatePropagationStopped(), "Contextmenu: event does propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't open channel page on contextmenu" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		assert.notOk( this.contextMenuStub.called, "Doesn't open context menu" );

		// anchor 2
		// left click
		event = await triggerEvent( anchorTwo, "click", { button: 0 } );
		assert.ok( event.isDefaultPrevented(), "Left click: default event is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Left click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.propEqual( this.openBrowserSpy.args, [ [ "https://bar.com/" ] ], "Opens browser" );
		this.openBrowserSpy.resetHistory();
		// middle click
		event = await triggerEvent( anchorTwo, "click", { button: 1 } );
		assert.ok( event.isDefaultPrevented(), "Middle click: default event is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Middle click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.propEqual( this.openBrowserSpy.args, [ [ "https://bar.com/" ] ], "Opens browser" );
		this.openBrowserSpy.resetHistory();
		// right click (doesn't execute callback)
		event = await triggerEvent( anchorTwo, "click", { button: 2 } );
		assert.ok( event.isDefaultPrevented(), "Right click: default event is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Right click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		// has a context menu
		event = await triggerEvent( anchorTwo, "contextmenu" );
		assert.ok( event.isDefaultPrevented(), "Contextmenu: default event action is prevented" );
		assert.ok( event.isImmediatePropagationStopped(), "Contextmenu: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
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

		assert.notOk( this.openBrowserSpy.called, "Browser hasn't been opened yet" );
		assert.notOk( this.clipboardSetSpy.called, "Set clipboard hasn't been called yet" );

		this.contextMenuStub.args[0][1][0].click();
		assert.propEqual( this.openBrowserSpy.args, [ [ "https://bar.com/" ] ], "Opens browser" );

		this.contextMenuStub.args[0][1][1].click();
		assert.propEqual( this.clipboardSetSpy.args, [ [ "https://bar.com/" ] ], "Sets clipboard" );

		// disabled events
		await Promise.all( "mousedown mouseup keyup keydown keypress"
			.split( " " )
			.map( async name => {
				const eventOne = await triggerEvent( anchorOne, name );
				assert.ok(
					eventOne.isDefaultPrevented(),
					`First link: default ${name} action is prevented`
				);
				const eventTwo = await triggerEvent( anchorTwo, name );
				assert.ok(
					eventTwo.isDefaultPrevented(),
					`Second link: default ${name} action is prevented`
				);
			}) );
	});

});
