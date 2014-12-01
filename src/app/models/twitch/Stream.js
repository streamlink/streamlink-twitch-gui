define( [ "ember-data", "moment" ], function( DS, Moment ) {

	return DS.Model.extend({
		channel: DS.belongsTo( "twitchChannel" ),
		created_at: DS.attr( "date" ),
		game: DS.attr( "string" ),
		preview: DS.belongsTo( "twitchImage" ),
		viewers: DS.attr( "number" ),


		title_created_at: function() {
			var	created_at	= this.get( "created_at" ),
				formatted	= Moment( created_at ).format( "LTS" );
			return "Online since %@".fmt( formatted );
		}.property( "created_at" ),

		title_viewers: function() {
			var	viewers	= this.get( "viewers" ),
				numerus	= viewers === 1 ? "person is" : "people are";
			return "%@ %@ watching".fmt( viewers, numerus );
		}.property( "viewers" )

	}).reopenClass({
		toString: function() { return "streams"; }
	});

});
