import Controller from "@ember/controller";
import {
	get,
	computed
} from "@ember/object";
import { main as config } from "config";
import metadata from "metadata";


export default Controller.extend({
	metadata,
	config,

	releaseurl: computed( "config.urls.release", "metadata.package.version", function() {
		let release = get( this, "config.urls.release" );
		let version = get( this, "metadata.package.version" );

		return release.replace( "{version}", version );
	}),

	dependencies: computed( "metadata.dependencies", function() {
		let deps = get( this, "metadata.dependencies" );

		return Object.keys( deps ).map(function( key ) {
			return {
				title  : key,
				version: deps[ key ]
			};
		});
	})
});
