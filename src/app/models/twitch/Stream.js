define( [ "Ember", "EmberData", "Moment" ], function( Ember, DS, Moment ) {

	var get = Ember.get;
	var attr = DS.attr;
	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		average_fps: attr( "number" ),
		channel: belongsTo( "twitchChannel", { async: false } ),
		created_at: attr( "date" ),
		game: attr( "string" ),
		preview: belongsTo( "twitchImage", { async: false } ),
		video_height: attr( "number" ),
		viewers: attr( "number" ),


		title_created_at: function() {
			var created_at = get( this, "created_at" );
			var moment     = new Moment( created_at );
			var diff       = moment.diff( new Date(), "days" );
			var formatted  = moment.format( diff === 0 ? "LTS" : "llll" );
			return "Online since " + formatted;
		}.property( "created_at" ),

		title_viewers: function() {
			var viewers = get( this, "viewers" );
			var numerus = viewers === 1 ? " person is watching" : " people are watching";
			return viewers + numerus;
		}.property( "viewers" ),

		resolution: function() {
			// assume 16:9
			var video_height = get( this, "video_height" );
			var width  = Math.round( ( 16 / 9 ) * video_height );
			var height = Math.round( video_height );
			return width + "x" + height;
		}.property( "video_height" ),

		fps: function() {
			var average_fps = get( this, "average_fps" );
			return Math.ceil( average_fps );
		}.property( "average_fps" )

	}).reopenClass({
		toString: function() { return "kraken/streams"; }
	});

});
