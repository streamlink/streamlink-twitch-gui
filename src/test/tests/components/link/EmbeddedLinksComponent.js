import {
	module,
	test
} from "qunit";
import {
	runAppend,
	runDestroy,
	getElem,
	buildOwner,
	fixtureElement
} from "test-utils";
import {
	setOwner,
	HTMLBars,
	Component,
	EventDispatcher,
	Service
} from "ember";
import EmbeddedLinksComponent from "components/link/EmbeddedLinksComponent";
import externalLinkComponentInjector
	from "inject-loader?-utils/getStreamFromUrl!components/link/ExternalLinkComponent";

const { compile } = HTMLBars;

let eventDispatcher, owner, context;


module( "components/link/EmbeddedLinksComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "component:embedded-links", EmbeddedLinksComponent );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "EmbeddedLinksComponent", assert => {

	const ExternalLinkComponent = externalLinkComponentInjector({
		"nwjs/Clipboard": {},
		"nwjs/Shell": {},
		"nwjs/Menu": {}
	})[ "default" ];
	owner.register( "component:external-link", ExternalLinkComponent );

	owner.register( "service:-routing", Service.extend() );

	context = Component.extend({
		text: "foo https://twitch.tv/foo bar https://bar.com baz @baz qux",
		layout: compile( "{{embedded-links text=text}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );

	const $component = getElem( context, ".embedded-links-component" );
	const $anchors = $component.find( ".external-link-component" );
	assert.strictEqual( $anchors.length, 3, "Renders all ExternalLinkComponents" );
	assert.ok( !$anchors.slice( 0, 1 ).hasClass( "external-link" ), "First link is internal" );
	assert.ok( $anchors.slice( 1 ).hasClass( "external-link" ), "Remaining links are external" );
	assert.strictEqual(
		$component.text(),
		"foo https://twitch.tv/foo bar https://bar.com baz @baz qux",
		"Component has the correct text child nodes"
	);

});
