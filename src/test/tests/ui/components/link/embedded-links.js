import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import Service from "@ember/service";

import EmbeddedLinksComponent from "ui/components/link/embedded-links/component";
import externalLinkComponentInjector
	from "inject-loader?-utils/getStreamFromUrl!ui/components/link/external-link/component";


moduleForComponent( "ui/components/link/embedded-links", {
	integration: true,
	resolver: buildResolver({
		EmbeddedLinksComponent
	}),
	beforeEach() {
		const { default: ExternalLinkComponent } = externalLinkComponentInjector({
			"nwjs/Clipboard": {},
			"nwjs/Shell": {}
		});
		this.registry.register( "component:external-link", ExternalLinkComponent );
		this.registry.register( "service:nwjs", Service.extend() );
		this.registry.register( "service:-routing", Service.extend() );
	}
});


test( "EmbeddedLinksComponent", function( assert ) {

	this.set( "text", "foo https://twitch.tv/foo bar https://bar.com baz @baz qux" );
	this.render( hbs`{{embedded-links text=text}}` );

	const $component = this.$( ".embedded-links-component" );
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
