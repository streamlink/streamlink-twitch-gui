define([
	"ember",
	"ember-data",
	"models/localstorage/Settings"
], function( Ember, DS, Settings ) {

	var attributes = [
		"quality",
		"gui_openchat",
		"notify_enabled"
	];

	// Can't add attributes on runtime (init()) due to ember's caching policy, so do it this way
	var attrs = {};
	attributes.forEach(function( name ) {
		var meta = Settings.metaForProperty( name );
		if ( !meta || !meta.isAttribute ) { return; }
		attrs[ name ] = DS.attr( meta.type, { defaultValue: null } );
	});


	return DS.Model.extend( attrs ).reopenClass({
		toString: function() { return "ChannelSettings"; }
	});

});
