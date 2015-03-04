define( [ "ember-data", "moment" ], function( DS, moment ) {

	return DS.Model.extend({
		average_fps: DS.attr( "number" ),
		channel: DS.belongsTo( "twitchChannel" ),
		created_at: DS.attr( "date" ),
		game: DS.attr( "string" ),
		preview: DS.belongsTo( "twitchImage" ),
		video_height: DS.attr( "number" ),
		viewers: DS.attr( "number" ),


		title_created_at: function() {
			var created_at = moment( this.get( "created_at" ) );
			return "Online since %@".fmt( created_at.format(
				created_at.diff( new Date(), "days" ) === 0 ? "LTS" : "llll"
			) );
		}.property( "created_at" ),

		title_viewers: function() {
			var viewers = this.get( "viewers" ),
			    numerus = viewers === 1 ? "person is" : "people are";
			return "%@ %@ watching".fmt( viewers, numerus );
		}.property( "viewers" )

	}).reopenClass({
		toString: function() { return "streams"; }
	});

});
