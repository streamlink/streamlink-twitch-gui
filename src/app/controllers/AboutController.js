import Ember from "Ember";
import config from "config";
import metadata from "metadata";


var get = Ember.get;


export default Ember.Controller.extend({
	metadata,

	nwjsVersion: config.main[ "nwjs-version" ],

	dependencies: function() {
		var deps = get( this, "metadata.dependencies" );
		return Object.keys( deps ).map(function( key ) {
			return {
				title  : key,
				version: deps[ key ]
			};
		});
	}.property( "metadata.dependencies" )
});
