import {
	get,
	Controller
} from "Ember";
import { main } from "config";
import metadata from "metadata";


const { "nwjs-version": nwjsVersion } = main;


export default Controller.extend({
	metadata,
	nwjsVersion,

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
