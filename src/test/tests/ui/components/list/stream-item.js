import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { set } from "@ember/object";
import Service from "@ember/service";

import StreamItemComponent from "ui/components/list/stream-item/component";


// TODO: finish stream-item-component tests
module( "ui/components/list/stream-item", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			StreamItemComponent: StreamItemComponent.extend({
				// remove layout for now
				layout: hbs``
			})
		})
	});

	hooks.beforeEach(function() {
		this.owner.register( "service:settings", Service.extend({
			content: {
				hasAnyStreamsLanguagesSelection: true,
				hasSingleStreamsLanguagesSelection: true,
				streams: {
					languages_fade: true,
					languages_filter: false,
					filter_vodcast: false,
					languages: {
						toJSON: () => ({
							de: false,
							en: true,
							fr: false
						})
					}
				}
			}
		}) );
	});


	test( "fading_enabled", function( assert ) {
		const { content: settings } = this.owner.lookup( "service:settings" );
		const subject = this.owner.lookup( "component:stream-item" );

		assert.ok( subject.fading_enabled, "Enabled initially" );

		set( settings, "hasAnyStreamsLanguagesSelection", false );
		set( settings, "hasSingleStreamsLanguagesSelection", false );
		assert.notOk( subject.fading_enabled, "Disabled if no language selected" );

		set( settings, "hasAnyStreamsLanguagesSelection", true );
		set( settings, "hasSingleStreamsLanguagesSelection", true );
		set( settings, "streams.languages_filter", true );
		assert.notOk( subject.fading_enabled, "Disabled if filtering is active" );

		set( settings, "hasSingleStreamsLanguagesSelection", false );
		assert.ok( subject.fading_enabled, "Enabled if filtering active but invalid" );
	});


	test( "faded", function( assert ) {
		const Subject = this.owner.factoryFor( "component:stream-item" );
		const subject = Subject.create({
			fading_enabled: true,
			content: {
				language: undefined,
				channel: {
					broadcaster_language: undefined
				}
			}
		});

		assert.notOk( subject.faded, "Not faded if channel language is missing" );

		set( subject, "content.language", "de" );
		assert.ok( subject.faded, "Faded if channel language differs" );

		set( subject, "content.language", "en" );
		assert.notOk( subject.faded, "Not faded if broadcaster language is missing" );

		set( subject, "content.channel.broadcaster_language", "en" );
		assert.notOk( subject.faded, "Not faded if broadcaster language is equal" );

		set( subject, "content.language", "other" );
		assert.notOk( subject.faded, "Not faded if language differs" );

		set( subject, "content.channel.broadcaster_language", "other" );
		assert.ok( subject.faded, "Faded if broadcaster language differs" );

		set( subject, "fading_enabled", false );
		assert.notOk( subject.faded, "Not faded if fading disabled" );
	});


	test( "fadedVodcast", function( assert ) {
		const Subject = this.owner.factoryFor( "component:stream-item" );
		const subject = Subject.create({
			content: {
				isVodcast: false
			}
		});

		assert.notOk( subject.fadedVodcast, "Not faded if it's not a vodcast" );

		set( subject, "content.isVodcast", true );
		assert.notOk( subject.fadedVodcast, "Not faded if vodcast filtering is disabled" );

		set( subject, "settings.content.streams.filter_vodcast", true );
		assert.ok( subject.fadedVodcast, "Faded if vodcast filtering is enabled" );

		set( subject, "content.isVodcast", false );
		assert.notOk( subject.fadedVodcast, "Not faded if not a vodcast anymore" );
	});


	test( "isFaded element class", async function( assert ) {
		this.setProperties({
			faded: false,
			fadedVodcast: false
		});
		await render( hbs`{{stream-item faded=faded fadedVodcast=fadedVodcast}}` );
		const elem = this.element.querySelector( ".stream-item-component" );

		assert.notOk(
			elem.classList.contains( "faded" ),
			"Not faded if faded and fadedVodcast are falsy"
		);

		this.setProperties({
			faded: true,
			fadedVodcast: false
		});
		assert.ok(
			elem.classList.contains( "faded" ),
			"Faded if faded or fadedVodcast are truthy"
		);

		this.setProperties({
			faded: false,
			fadedVodcast: true
		});
		assert.ok(
			elem.classList.contains( "faded" ),
			"Faded if faded or fadedVodcast are truthy"
		);

		this.setProperties({
			faded: true,
			fadedVodcast: true
		});
		assert.ok(
			elem.classList.contains( "faded" ),
			"Faded if faded or fadedVodcast are truthy"
		);
	});

});
