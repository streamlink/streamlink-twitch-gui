define([
	"Ember",
	"nwjs/clipboard",
	"components/button/FormButtonComponent"
], function(
	Ember,
	clipboard,
	FormButtonComponent
) {

	var get = Ember.get;


	return FormButtonComponent.extend({
		"class" : "btn-info",
		icon    : "fa-share-alt",
		title   : "Copy channel url to clipboard",
		iconanim: true,

		action: "share",

		actions: {
			"share": function( success, failure ) {
				clipboard.set( get( this, "channel.url" ) )
					.then( success, failure )
					.catch(function() {});
			}
		}
	});

});
