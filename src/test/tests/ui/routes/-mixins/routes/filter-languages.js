import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { visit } from "@ember/test-helpers";
import sinon from "sinon";

import { set } from "@ember/object";
import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import Service from "@ember/service";

import FilterLanguagesMixin from "ui/routes/-mixins/routes/filter-languages";
import {
	ATTR_STREAMS_LANGUAGES_FADE,
	ATTR_STREAMS_LANGUAGES_FILTER
} from "data/models/settings/streams/fragment";


module( "ui/routes/-mixins/routes/filter-languages", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map( function() {
			this.route( "foo", { path: "/foo" } );
			this.route( "bar", { path: "/bar/:bar" } );
		}),

		FooRoute: Route.extend( FilterLanguagesMixin ),
		BarRoute: Route.extend( FilterLanguagesMixin )
	});

	setupApplicationTest( hooks );

	/** @typedef {TestContext} TestContextFilterLanguagesMixin */
	/** @this TestContextFilterLanguagesMixin */
	hooks.beforeEach(function() {
		this.languagesStub = sinon.stub().returns({
			de: false,
			en: true
		});

		this.owner.register( "service:settings", Service.extend({
			content: {
				streams: {
					languages_filter: ATTR_STREAMS_LANGUAGES_FADE,
					languages: {
						toJSON: this.languagesStub
					}
				}
			}
		}) );
	});


	/** @this TestContextFilterLanguagesMixin */
	test( "No language without additional params", async function( assert ) {
		await visit( "/foo" );
		const { model } = this.owner.lookup( "controller:foo" );
		assert.propEqual( model, {}, "No language is set" );
	});

	/** @this TestContextFilterLanguagesMixin */
	test( "No language with additional params", async function( assert ) {
		await visit( "/bar/bar" );
		const { model } = this.owner.lookup( "controller:bar" );
		assert.propEqual( model, { bar: "bar" }, "No language is set" );
	});

	/** @this TestContextFilterLanguagesMixin */
	test( "Single language", async function( assert ) {
		const settings = this.owner.lookup( "service:settings" );
		set( settings, "content.streams.languages_filter", ATTR_STREAMS_LANGUAGES_FILTER );

		await visit( "/bar/bar" );
		const { model } = this.owner.lookup( "controller:bar" );
		assert.propEqual( model, { bar: "bar", language: [ "en" ] }, "One language" );
	});

	/** @this TestContextFilterLanguagesMixin */
	test( "Multiple languages", async function( assert ) {
		const settings = this.owner.lookup( "service:settings" );
		set( settings, "content.streams.languages_filter", ATTR_STREAMS_LANGUAGES_FILTER );

		this.languagesStub.returns({
			de: true,
			en: true
		});
		await visit( "/bar/bar" );
		const { model } = this.owner.lookup( "controller:bar" );
		assert.propEqual( model, { bar: "bar", language: [ "de", "en" ] }, "Two languages" );
	});
});
