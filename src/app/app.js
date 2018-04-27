import Application from "@ember/application";
import Router from "./router";
import app from "ember-app";


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


export default Application.create( app, {
	rootElement: "body",
	Router,

	toString() { return "App"; }
});
