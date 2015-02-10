define( [ "ember" ], function( Ember ) {

	var $     = Ember.$;
	var $node = $( "<div>" ).addClass( "previewError" );

	return Ember.Mixin.create({
		willInsertElement: function() {
			this._super.apply( this, arguments );

			this.$( ".previewImage" ).one( "error", function() {
				$( this ).replaceWith( $node.clone() );
			});
		}
	});

});
