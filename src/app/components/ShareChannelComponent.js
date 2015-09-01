define([
	"Ember",
	"nwjs/nwGui",
	"components/FormButtonComponent"
], function(
	Ember,
	nwGui,
	FormButtonComponent
) {

	var get = Ember.get;

	return FormButtonComponent.extend({
		metadata: Ember.inject.service(),

		"class" : "btn-info",
		icon    : "fa-share-alt",
		title   : "Copy channel url to clipboard",
		iconanim: true,

		action: "share",

		actions: {
			"share": function( callback ) {
				var url = get( this, "channel.url" );
				var cb  = nwGui.Clipboard.get();

				if ( url && cb ) {
					cb.set( url, "text" );

					if ( callback instanceof Function ) {
						callback();
					}
				}
			}
		}
	});

});
