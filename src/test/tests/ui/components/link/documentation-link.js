import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService } from "i18n-utils";
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

import documentationLinkComponentInjector
	from "inject-loader?config!ui/components/link/documentation-link/component";


module( "ui/components/link/documentation-link", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			I18nService: FakeI18nService
		})
	});

	stubDOMEvents( hooks );

	hooks.beforeEach(function() {
		const context = this;
		this.providerType = "streamlink";
		this.openBrowserSpy = sinon.spy();
		this.transitionToSpy = sinon.spy();

		this.owner.register( "service:nwjs", class extends Service {
			openBrowser = context.openBrowserSpy;
		});
		this.owner.register( "service:router", class extends Service {
			transitionTo = context.transitionToSpy;
		});
		this.owner.register( "service:settings", class extends Service {
			content = {
				streaming: {
					get providerType() {
						return context.providerType;
					},
					get isStreamlink() {
						return context.providerType === "streamlink";
					}
				}
			};
		});

		const { default: DocumentationLinkComponent } = documentationLinkComponentInjector({
			config: {
				streaming: {
					"docs-url": {
						streamlink: "https://streamlink.github.io/cli.html#cmdoption{item}",
						notStreamlink: "https://foo.bar/{item}"
					}
				}
			}
		});
		this.owner.register( "component:documentation-link", DocumentationLinkComponent );
	});


	test( "Streamlink documentation", async function( assert ) {
		await render( hbs`<DocumentationLink @item="--foo" @class="my-class" />` );

		const elem = this.element.querySelector( ".documentation-link-component" );
		assert.ok( elem instanceof HTMLSpanElement, "Component renders" );
		assert.ok( elem.classList.contains( "with-url" ), "Has a URL" );
		assert.strictEqual(
			window.getComputedStyle( elem ).cursor,
			"pointer",
			"Has a pointer cursor"
		);
		assert.ok( elem.classList.contains( "my-class" ), "Has custom class applied" );
		assert.strictEqual(
			elem.getAttribute( "title" ),
			"components.documentation-link.title",
			"Has a localized title"
		);
		assert.ok( elem.querySelector( "i.fa.fa-book" ), "Has a book icon" );

		const e = await triggerEvent( elem, "click" );
		assert.ok( isDefaultPrevented( e ), "Prevents default action on click" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops immediate propagation on click" );
		assert.ok(
			this.openBrowserSpy.calledOnceWithExactly(
				"https://streamlink.github.io/cli.html#cmdoption-foo"
			),
			"Opens correct documentation URL in web browser"
		);
		assert.notOk( this.transitionToSpy.called, "Doesn't transition to channel route" );
	});

	test( "Non-Streamlink documentation", async function( assert ) {
		this.providerType = "notStreamlink";

		await render( hbs`<DocumentationLink @item="--foo" />` );

		const elem = this.element.querySelector( ".documentation-link-component" );
		await triggerEvent( elem, "click" );
		assert.ok(
			this.openBrowserSpy.calledOnceWithExactly(
				"https://foo.bar/--foo"
			),
			"Opens correct documentation URL in web browser"
		);
	});

	test( "Custom baseUrl", async function( assert ) {
		await render( hbs`<DocumentationLink @item="--baz" @baseUrl="https://bar.foo/{item}" />` );

		const elem = this.element.querySelector( ".documentation-link-component" );
		await triggerEvent( elem, "click" );
		assert.ok(
			this.openBrowserSpy.calledOnceWithExactly(
				"https://bar.foo/--baz"
			),
			"Opens correct documentation URL in web browser"
		);
	});

	test( "Empty baseUrl", async function( assert ) {
		await render( hbs`<DocumentationLink @item="foo" @baseUrl="" />` );

		const elem = this.element.querySelector( ".documentation-link-component" );
		assert.notOk( elem.classList.contains( "with-url" ), "Doesn't have a URL" );
		assert.notStrictEqual(
			window.getComputedStyle( elem ).cursor,
			"pointer",
			"Doesn't have a pointer cursor"
		);
		assert.strictEqual( elem.getAttribute( "title" ), "", "Doesn't have a title" );

		await triggerEvent( elem, "click" );
		assert.notOk( this.openBrowserSpy.called, "Doesn't open web browser" );
	});
});
