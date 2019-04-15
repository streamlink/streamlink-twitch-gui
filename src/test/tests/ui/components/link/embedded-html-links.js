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

import EmbeddedHtmlLinksComponent from "ui/components/link/embedded-html-links/component";


module( "ui/components/link/embedded-html-links", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver()
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

		this.owner.register( "component:embedded-html-links", EmbeddedHtmlLinksComponent );
		this.owner.register( "service:nwjs", NwjsService );
		this.owner.register( "service:router", RouterService );
	});


	test( "EmbeddedHtmlLinksComponent", async function( assert ) {
		let e;

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
		e = await triggerEvent( anchorOne, "click", { button: 0 } );
		assert.ok( isDefaultPrevented( e ), "Left click: default event is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Left click: event doesn't propagate" );
		assert.propEqual(
			this.transitionToStub.args,
			[ [ "channel", "foo" ] ],
			"Opens channel page"
		);
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		this.transitionToStub.resetHistory();
		// middle click
		e = await triggerEvent( anchorOne, "click", { button: 1 } );
		assert.ok( isDefaultPrevented( e ), "Middle click: default event is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Middle click: event doesn't propagate" );
		assert.propEqual(
			this.transitionToStub.args,
			[ [ "channel", "foo" ] ],
			"Opens channel page"
		);
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		this.transitionToStub.resetHistory();
		// right click (doesn't execute transition)
		e = await triggerEvent( anchorOne, "click", { button: 2 } );
		assert.ok( isDefaultPrevented( e ), "Right click: default event is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Right click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't open channel page on non-left-click" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		// doesn't have a context menu
		e = await triggerEvent( anchorOne, "contextmenu" );
		assert.notOk( isDefaultPrevented( e ), "Contextmenu: default event is not prevented" );
		assert.notOk( isImmediatePropagationStopped( e ), "Contextmenu: event does propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't open channel page on contextmenu" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		assert.notOk( this.contextMenuStub.called, "Doesn't open context menu" );

		// anchor 2
		// left click
		e = await triggerEvent( anchorTwo, "click", { button: 0 } );
		assert.ok( isDefaultPrevented( e ), "Left click: default event is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Left click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.propEqual( this.openBrowserSpy.args, [ [ "https://bar.com/" ] ], "Opens browser" );
		this.openBrowserSpy.resetHistory();
		// middle click
		e = await triggerEvent( anchorTwo, "click", { button: 1 } );
		assert.ok( isDefaultPrevented( e ), "Middle click: default event is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Middle click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.propEqual( this.openBrowserSpy.args, [ [ "https://bar.com/" ] ], "Opens browser" );
		this.openBrowserSpy.resetHistory();
		// right click (doesn't execute callback)
		e = await triggerEvent( anchorTwo, "click", { button: 2 } );
		assert.ok( isDefaultPrevented( e ), "Right click: default event is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Right click: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
		// has a context menu
		e = await triggerEvent( anchorTwo, "contextmenu" );
		assert.ok( isDefaultPrevented( e ), "Contextmenu: default event action is prevented" );
		assert.ok( isImmediatePropagationStopped( e ), "Contextmenu: event doesn't propagate" );
		assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open browser" );
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
		assert.propEqual( this.openBrowserSpy.args, [ [ "https://bar.com/" ] ], "Opens browser" );

		this.contextMenuStub.args[0][1][1].click();
		assert.propEqual( this.clipboardSetSpy.args, [ [ "https://bar.com/" ] ], "Sets clipboard" );

		// disabled events
		await Promise.all( "mousedown mouseup keyup keydown keypress"
			.split( " " )
			.map( async name => {
				const eventOne = await triggerEvent( anchorOne, name );
				assert.ok(
					isDefaultPrevented( eventOne ),
					`First link: default ${name} action is prevented`
				);
				const eventTwo = await triggerEvent( anchorTwo, name );
				assert.ok(
					isDefaultPrevented( eventTwo ),
					`Second link: default ${name} action is prevented`
				);
			}) );
	});

});
