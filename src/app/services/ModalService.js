define( [ "Ember" ], function( Ember ) {

	var set = Ember.set;

	var reModalTemplateName = /^(?:Modal)?(\w)(\w+)(?:Modal)?$/i;

	function fnModalTemplateName( _, a, b ) {
		return "modal" + a.toUpperCase() + b;
	}


	return Ember.Service.extend({
		isModalOpened: false,


		init: function() {
			this.applicationRoute = this.container.lookup( "route:application" );
		},

		openModal: function( template, controller, data ) {
			template = template.replace( reModalTemplateName, fnModalTemplateName );

			if ( typeof controller === "string" ) {
				controller = this.container.lookup( "controller:" + controller );
			}
			if ( controller && data instanceof Object ) {
				controller.setProperties( data );
			}

			this.applicationRoute.render( template, {
				into      : "application",
				outlet    : "modal",
				controller: controller
			});

			set( this, "isModalOpened", true );
		},

		closeModal: function() {
			this.applicationRoute.disconnectOutlet({
				parentView: "application",
				outlet    : "modal"
			});

			set( this, "isModalOpened", false );
		}
	});

});
