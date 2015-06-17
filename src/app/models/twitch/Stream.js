define( [ "Ember", "EmberData", "Moment" ], function( Ember, DS, Moment ) {

	var get = Ember.get;

	return DS.Model.extend({
		average_fps: DS.attr( "number" ),
		channel: DS.belongsTo( "twitchChannel" ),
		created_at: DS.attr( "date" ),
		game: DS.attr( "string" ),
		preview: DS.belongsTo( "twitchImage" ),
		video_height: DS.attr( "number" ),
		viewers: DS.attr( "number" ),


		title_created_at: function() {
			var created_at = get( this, "created_at" );
			var moment     = new Moment( created_at );
			var diff       = moment.diff( new Date(), "days" );
			var formatted  = moment.format( diff === 0 ? "LTS" : "llll" );
			return "Online since %@".fmt( formatted );
		}.property( "created_at" ),

		title_viewers: function() {
			var viewers = get( this, "viewers" );
			var numerus = viewers === 1 ? "person is" : "people are";
			return "%@ %@ watching".fmt( viewers, numerus );
		}.property( "viewers" )

	}).reopenClass({
		toString: function() { return "kraken/streams"; }
	});

});
