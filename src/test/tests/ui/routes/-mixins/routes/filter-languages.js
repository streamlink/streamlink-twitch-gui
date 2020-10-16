import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { visit } from "@ember/test-helpers";

import { set } from "@ember/object";
import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import Service from "@ember/service";

import FilterLanguagesMixin from "ui/routes/-mixins/routes/filter-languages";


module( "ui/routes/-mixins/routes/filter-languages", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map( function() {
			this.route( "foo", { path: "/foo" } );
			this.route( "bar", { path: "/bar/:bar" } );
		}),

		FooRoute: Route.extend( FilterLanguagesMixin ),
		BarRoute: Route.extend( FilterLanguagesMixin ),
		SettingsService: Service.extend({
			content: {
				hasSingleStreamsLanguagesSelection: true,
				streams: {
					languages_filter: false,
					languages: {
						toJSON: () => ({
							de: false,
							en: true
						})
					}
				}
			}
		})
	});

	setupApplicationTest( hooks );


	test( "Language property in model", async function( assert ) {
		await visit( "/foo" );
		{
			const { model } = this.owner.lookup( "controller:foo" );
			assert.propEqual( model, { language: undefined }, "Language is undefined" );
		}

		await visit( "/bar/bar" );
		{
			const { model } = this.owner.lookup( "controller:bar" );
			assert.propEqual( model, { bar: "bar", language: undefined }, "Language is undefined" );
		}

		const settings = this.owner.lookup( "service:settings" );
		set( settings, "content.streams.languages_filter", true );

		const route = this.owner.lookup( "route:bar" );
		await route.refresh();
		{
			const { model } = this.owner.lookup( "controller:bar" );
			assert.propEqual( model, { bar: "bar", language: "en" }, "Language is set" );
		}
	});
});
