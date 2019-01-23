import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Service from "@ember/service";

import EmbeddedLinksComponent from "ui/components/link/embedded-links/component";
import externalLinkComponentInjector
	from "inject-loader?-utils/getStreamFromUrl!ui/components/link/external-link/component";


module( "ui/components/link/embedded-links", function( hooks ) {
	const { default: ExternalLinkComponent } = externalLinkComponentInjector({
		"nwjs/Clipboard": {},
		"nwjs/Shell": {}
	});

	setupRenderingTest( hooks, {
		resolver: buildResolver({
			EmbeddedLinksComponent,
			ExternalLinkComponent
		})
	});

	hooks.beforeEach(function() {
		this.owner.register( "service:nwjs", Service.extend() );
		this.owner.register( "service:router", Service.extend() );
	});


	test( "EmbeddedLinksComponent", async function( assert ) {
		this.set( "text", "foo https://twitch.tv/foo bar https://bar.com baz @baz qux" );
		await render( hbs`{{embedded-links text=text}}` );

		const component = this.element.querySelector( ".embedded-links-component" );
		const anchors = Array.from( component.querySelectorAll( ".external-link-component" ) );
		assert.strictEqual( anchors.length, 3, "Renders all ExternalLinkComponents" );
		assert.notOk(
			anchors[ 0 ].classList.contains( "external-link" ),
			"First link is internal"
		);
		assert.ok(
			anchors.slice( 1 ).every( e => e.classList.contains( "external-link" ) ),
			"Other links are external"
		);
		assert.strictEqual(
			component.innerText,
			"foo https://twitch.tv/foo bar https://bar.com baz @baz qux",
			"Component has the correct text child nodes"
		);
	});

});
