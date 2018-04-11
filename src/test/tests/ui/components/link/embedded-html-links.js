import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import Service from "@ember/service";
import $ from "jquery";
import sinon from "sinon";

import embeddedHtmlLinksComponentInjector
	from "inject-loader?-utils/getStreamFromUrl!ui/components/link/embedded-html-links/component";


moduleForComponent( "ui/components/link/embedded-html-links", {
	integration: true,
	resolver: buildResolver( {} ),
	beforeEach() {
		this.clipboardSetStub = sinon.stub();
		this.openBrowserStub = sinon.stub();
		this.contextMenuStub = sinon.stub();
		this.transitionToStub = sinon.stub();

		const { default: EmbeddedHtmlLinksComponent } = embeddedHtmlLinksComponentInjector({
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
		const RoutingService = Service.extend({
			transitionTo: this.transitionToStub
		});

		this.registry.register( "component:embedded-html-links", EmbeddedHtmlLinksComponent );
		this.registry.register( "service:nwjs", NwjsService );
		this.registry.register( "service:-routing", RoutingService );
	}
});


test( "EmbeddedHtmlLinksComponent", function( assert ) {

	let event;

	this.render( hbs`
		{{~#embedded-html-links~}}
			<a href="https://twitch.tv/foo">foo</a><br>
			<a href="https://bar.com/">bar.com</a>
		{{~/embedded-html-links~}}
	` );

	const $anchors = this.$( "a" );
	const $anchorOne = $anchors.eq( 0 );
	const $anchorTwo = $anchors.eq( 1 );

	assert.notOk( $anchorOne.hasClass( "external-link" ), "First link is not external" );
	assert.strictEqual(
		$anchorOne.prop( "title" ),
		"",
		"First link doesn't have a title property"
	);
	assert.ok( $anchorTwo.hasClass( "external-link" ), "Second link is external" );
	assert.strictEqual(
		$anchorTwo.prop( "title" ),
		"https://bar.com/",
		"Second link has a title property"
	);

	// anchor 1
	// trigger mouseup events
	// left click
	event = $.Event( "mouseup", { button: 0 } );
	$anchorOne.trigger( event );
	assert.ok( event.isDefaultPrevented(), "Left click: default event is prevented" );
	assert.ok( event.isImmediatePropagationStopped(), "Left click: event doesn't propagate" );
	assert.propEqual( this.transitionToStub.args, [ [ "channel", "foo" ] ], "Opens channel page" );
	assert.notOk( this.openBrowserStub.called, "Doesn't open browser" );
	this.transitionToStub.resetHistory();
	// middle click (doesn't execute transition)
	event = $.Event( "mouseup", { button: 1 } );
	$anchorOne.trigger( event );
	assert.notOk( event.isDefaultPrevented(), "Middle click: default event is not prevented" );
	assert.notOk( event.isImmediatePropagationStopped(), "Middle click: event does propagate" );
	assert.notOk( this.transitionToStub.called, "Doesn't open channel page on non-left-click" );
	assert.notOk( this.openBrowserStub.called, "Doesn't open browser" );
	// right click (doesn't execute transition)
	event = $.Event( "mouseup", { button: 2 } );
	$anchorOne.trigger( event );
	assert.notOk( event.isDefaultPrevented(), "Right click: default event is not prevented" );
	assert.notOk( event.isImmediatePropagationStopped(), "Right click: event does propagate" );
	assert.notOk( this.transitionToStub.called, "Doesn't open channel page on non-left-click" );
	assert.notOk( this.openBrowserStub.called, "Doesn't open browser" );
	// doesn't have a context menu
	event = $.Event( "contextmenu" );
	$anchorOne.trigger( event );
	assert.notOk( event.isDefaultPrevented(), "Contextmenu: default event is not prevented" );
	assert.notOk( event.isImmediatePropagationStopped(), "Contextmenu: event does propagate" );
	assert.notOk( this.transitionToStub.called, "Doesn't open channel page on contextmenu" );
	assert.notOk( this.openBrowserStub.called, "Doesn't open browser" );
	assert.notOk( this.contextMenuStub.called, "Doesn't open context menu" );

	// anchor 2
	// trigger mouseup events
	// left click
	event = $.Event( "mouseup", { button: 0 } );
	$anchorTwo.trigger( event );
	assert.ok( event.isDefaultPrevented(), "Left click: default event is prevented" );
	assert.ok( event.isImmediatePropagationStopped(), "Left click: event doesn't propagate" );
	assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
	assert.propEqual( this.openBrowserStub.args, [ [ "https://bar.com/" ] ], "Opens browser" );
	this.openBrowserStub.resetHistory();
	// middle click
	event = $.Event( "mouseup", { button: 1 } );
	$anchorTwo.trigger( event );
	assert.ok( event.isDefaultPrevented(), "Middle click: default event is prevented" );
	assert.ok( event.isImmediatePropagationStopped(), "Middle click: event doesn't propagate" );
	assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
	assert.propEqual( this.openBrowserStub.args, [ [ "https://bar.com/" ] ], "Opens browser" );
	this.openBrowserStub.resetHistory();
	// right click (doesn't execute callback)
	event = $.Event( "mouseup", { button: 2 } );
	$anchorTwo.trigger( event );
	assert.notOk( event.isDefaultPrevented(), "Right click: default event is not prevented" );
	assert.notOk( event.isImmediatePropagationStopped(), "Right click: event does propagate" );
	assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
	assert.notOk( this.openBrowserStub.called, "Doesn't open browser" );
	// has a context menu
	event = $.Event( "contextmenu" );
	$anchorTwo.trigger( event );
	assert.ok( event.isDefaultPrevented(), "Contextmenu: default event action is prevented" );
	assert.ok( event.isImmediatePropagationStopped(), "Contextmenu: event doesn't propagate" );
	assert.notOk( this.transitionToStub.called, "Doesn't transition to different route" );
	assert.notOk( this.openBrowserStub.called, "Doesn't open browser" );
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
	assert.propEqual( this.openBrowserStub.args, [ [ "https://bar.com/" ] ], "Opens browser" );

	this.contextMenuStub.args[0][1][1].click();
	assert.propEqual( this.clipboardSetStub.args, [ [ "https://bar.com/" ] ], "Sets clipboard" );

	// disabled events
	"mousedown click dblclick keyup keydown keypress"
		.split( " " )
		.forEach( name => {
			const eventOne = $.Event( name );
			const eventTwo = $.Event( name );
			$anchorOne.trigger( eventOne );
			assert.notOk(
				eventOne.isDefaultPrevented(),
				`First link: default ${name} action is not prevented`
			);
			$anchorTwo.trigger( eventTwo );
			assert.ok(
				eventTwo.isDefaultPrevented(),
				`Second link: default ${name} action is prevented`
			);
		});

});
