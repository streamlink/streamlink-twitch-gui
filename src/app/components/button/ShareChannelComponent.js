import Ember from "Ember";
import clipboard from "nwjs/clipboard";
import FormButtonComponent from "components/button/FormButtonComponent";


	var get = Ember.get;


	export default FormButtonComponent.extend({
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
