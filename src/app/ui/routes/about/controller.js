import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { main as config, locales as localesConfig } from "config";
import metadata from "metadata";
import "./styles.less";


export default Controller.extend({
	metadata,
	config,
	localesConfig,

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
