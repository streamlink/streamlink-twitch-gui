import {
	module,
	test
} from "qunit";
import {
	runAppend,
	runDestroy,
	getElem,
	getOutput,
	buildOwner,
	fixtureElement
} from "test-utils";
import {
	set,
	setOwner,
	run,
	$,
	HTMLBars,
	Component,
	EventDispatcher,
	Service
} from "ember";
import externalLinkComponentInjector
	from "inject-loader?-utils/getStreamFromUrl!components/link/ExternalLinkComponent";

const { compile } = HTMLBars;

let eventDispatcher, owner, context;


module( "components/link/ExternalLinkComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "ExternalLinkComponent", assert => {

	assert.expect( 21 );

	let event;
	let expectedSetClipboard;
	let expectedOpenBrowser;

	const ExternalLinkComponent = externalLinkComponentInjector({
		"nwjs/Clipboard": {
			set( url ) {
				assert.strictEqual( url, expectedSetClipboard, "Calls setClipboard()" );
			}
		},
		"nwjs/Shell": {
			openBrowser( url ) {
				assert.strictEqual( url, expectedOpenBrowser, "Calls openBrowser()" );
			}
		},
		"nwjs/Menu": {
			create: () => ({
				items: {
					pushObjects( objs ) {
						assert.ok( Array.isArray( objs ), "Creates a context menu" );
						assert.propEqual(
							objs.mapBy( "label" ),
							[
								"Open in browser",
								"Copy link address"
							],
							"Context menu has the correct item labels"
						);
						objs.forEach( obj => obj.click() );
					}
				},
				popup( e ) {
					assert.strictEqual( e, event, "Calls menu.popup( event )" );
				}
			})
		}
	})[ "default" ];
	owner.register( "component:external-link", ExternalLinkComponent );

	owner.register( "service:-routing", Service.extend({
		transitionTo( route, model ) {
			assert.strictEqual( route, "channel", "Transitions to the channel route" );
			assert.strictEqual( model, "foo", "Channel has the correct model" );
		}
	}) );

	context = Component.extend({
		url: "https://twitch.tv/foo",
		text: "foo",
		layout: compile( "{{#external-link url=url}}{{text}}{{/external-link}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );

	expectedOpenBrowser = "https://twitch.tv/foo";

	const $component = getElem( context, ".external-link-component" );
	assert.ok( $component[0] instanceof HTMLAnchorElement, "Component renders" );
	assert.strictEqual( getOutput( context ), "foo", "Component has the correct content" );
	assert.ok( !$component.hasClass( "external-link" ), "Twitch channel links are not external" );
	assert.ok( !$component.prop( "title" ), "Internal links don't have a title" );
	assert.strictEqual( $component.attr( "href" ), "#", "Has the correct href attr" );
	// trigger click event
	event = $.Event( "click" );
	$component.trigger( event );
	assert.ok( event.isDefaultPrevented(), "Default event action is prevented" );
	assert.ok( event.isImmediatePropagationStopped(), "Event doesn't propagate" );
	// doesn't have a context menu
	event = $.Event( "contextmenu" );
	$component.trigger( event );

	expectedOpenBrowser = "https://bar.com/";
	run( () => set( context, "url", expectedOpenBrowser ) );

	assert.ok(
		$component.hasClass( "external-link" ),
		"The external-link class is set on external links"
	);
	assert.strictEqual(
		$component.prop( "title" ),
		expectedOpenBrowser,
		"External links have a title"
	);
	// trigger click event
	event = $.Event( "click" );
	$component.trigger( event );
	assert.ok( event.isDefaultPrevented(), "Default event action is prevented" );
	assert.ok( event.isImmediatePropagationStopped(), "Event doesn't propagate" );
	// has a context menu
	expectedSetClipboard = "https://bar.com/";
	event = $.Event( "contextmenu" );
	$component.trigger( event );
	assert.ok( event.isDefaultPrevented(), "Default event action is prevented" );
	assert.ok( event.isImmediatePropagationStopped(), "Event doesn't propagate" );

});
