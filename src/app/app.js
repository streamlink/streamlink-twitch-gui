import "shim";
import "jquery";
import "ember-source/dist/ember.debug";
import Application from "@ember/application";
import "./logger";
import "./store";
import modules from "./app-modules";


function initialize( require, fn ) {
	require.keys().forEach( ( ...args ) => fn( require( ...args ) ) );
}

initialize(
	require.context( "init/initializers/", true, /^.\x2F([^\x2F]+(\x2Findex)?)\.js$/ ),
	({ default: module }) => Application.initializer( module )
);
initialize(
	require.context( "init/instance-initializers/", true, /^.\x2F([^\x2F]+(\x2Findex)?)\.js$/ ),
	({ default: module }) => Application.instanceInitializer( module )
);


export default Application.create( modules, {
	rootElement: "body",

	toString() { return "App"; }
});
