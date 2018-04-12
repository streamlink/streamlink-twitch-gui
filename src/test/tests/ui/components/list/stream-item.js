import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import { get, set, setProperties } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import StreamItemComponent from "ui/components/list/stream-item/component";


moduleForComponent( "stream-item", "ui/components/list/stream-item", {
	unit: true,
	resolver: buildResolver({
		StreamItemComponent
	}),
	beforeEach() {
		this.register( "service:settings", Service.extend({
			hasStreamsLanguagesSelection: true,
			streams: {
				filter_languages: false,
				filter_vodcast: false,
				languages: {
					toJSON: () => ({
						de: true,
						en: true,
						fr: false
					})
				}
			}
		}) );
	}
});


test( "faded", function( assert ) {

	const subject = this.subject({
		content: {
			channel: {
				language: undefined,
				broadcaster_language: undefined
			}
		}
	});

	assert.notOk( get( subject, "faded" ), "Not faded if channel language is missing" );

	set( subject, "content.channel.language", "en" );
	assert.notOk( get( subject, "faded" ), "Not faded if language has been enabled" );

	set( subject, "content.channel.language", "fr" );
	assert.ok( get( subject, "faded" ), "Faded if language has been disabled" );

	set( subject, "content.channel.broadcaster_language", "de" );
	assert.notOk( get( subject, "faded" ), "Not faded if broadcaster language has been enabled" );

	set( subject, "content.channel.broadcaster_language", "fr" );
	assert.ok( get( subject, "faded" ), "Faded if broadcaster language has been disabled" );

	set( subject, "content.channel.language", "en" );
	set( subject, "content.channel.broadcaster_language", "other" );
	assert.ok( get( subject, "faded" ), "Faded if broadcaster language is 'other'" );

	set( subject, "settings.hasStreamsLanguagesSelection", false );
	assert.notOk( get( subject, "faded" ), "Not faded if no custom stream language selection" );

	set( subject, "settings.hasStreamsLanguagesSelection", true );
	set( subject, "settings.streams.filter_languages", true );
	assert.notOk( get( subject, "faded" ), "Not faded if filtering is enabled" );

});


test( "fadedVodcast", function( assert ) {

	const subject = this.subject({
		content: {
			isVodcast: false
		}
	});

	assert.notOk( get( subject, "fadedVodcast" ), "Not faded if it's not a vodcast" );

	set( subject, "content.isVodcast", true );
	assert.notOk( get( subject, "fadedVodcast" ), "Not faded if vodcast filtering is disabled" );

	set( subject, "settings.streams.filter_vodcast", true );
	assert.ok( get( subject, "fadedVodcast" ), "Faded if vodcast filtering is enabled" );

	set( subject, "content.isVodcast", false );
	assert.notOk( get( subject, "fadedVodcast" ), "Not faded if not a vodcast anymore" );

});


test( "isFaded element class", function( assert ) {

	const subject = this.subject({
		layout: hbs``,
		faded: false,
		fadedVodcast: false
	});

	this.render();
	const $elem = this.$();

	assert.notOk( $elem.hasClass( "faded" ), "Not faded if faded and fadedVodcast are falsy" );

	run( () => setProperties( subject, {
		faded: true,
		fadedVodcast: false
	}) );
	assert.ok( $elem.hasClass( "faded" ), "Faded if faded or fadedVodcast are truthy" );

	run( () => setProperties( subject, {
		faded: false,
		fadedVodcast: true
	}) );
	assert.ok( $elem.hasClass( "faded" ), "Faded if faded or fadedVodcast are truthy" );

	run( () => setProperties( subject, {
		faded: true,
		fadedVodcast: true
	}) );
	assert.ok( $elem.hasClass( "faded" ), "Faded if faded or fadedVodcast are truthy" );

});
