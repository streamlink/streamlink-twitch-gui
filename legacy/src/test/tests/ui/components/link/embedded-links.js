import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Service from "@ember/service";

import EmbeddedLinksComponent from "ui/components/link/embedded-links/component";
import ExternalLinkComponent from "ui/components/link/external-link/component";


module( "ui/components/link/embedded-links", function( hooks ) {
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
		this.set( "text", "foo twitch.tv/foo bar bar.com baz @baz qux" );
		await render( hbs`{{embedded-links text=text}}` );

		const component = this.element.querySelector( ".embedded-links-component" );
		const anchors = Array.from( component.querySelectorAll( ".external-link-component" ) );
		assert.propEqual(
			anchors.map( e => ([ e.classList.contains( "external-link" ), e.title ]) ),
			[
				[ false, "" ],
				[ true, "https://bar.com" ],
				[ true, "https://x.com/baz" ]
			],
			"First link is internal, other links are external"
		);
		assert.propEqual(
			anchors.map( e => e.tabIndex ),
			[ -1, -1, -1 ],
			"All anchors have their tabIndex set to -1"
		);
		assert.strictEqual(
			component.innerText,
			"foo twitch.tv/foo bar bar.com baz @baz qux",
			"Component has the correct text child nodes"
		);
	});

});
