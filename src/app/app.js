import "shim";
import { Application } from "ember";
import "./logger";
import "./store";
import modules from "./app-modules";


function initialize( require, fn ) {
	require.keys().forEach( ( ...args ) => fn( require( ...args ) ) );
}

initialize(
	require.context( "./initializers/", true, /^.\x2F([^\x2F]+(\x2Findex)?)\.js$/ ),
	({ default: module }) => Application.initializer( module )
);
initialize(
	require.context( "./instance-initializers/", true, /^.\x2F([^\x2F]+(\x2Findex)?)\.js$/ ),
	({ default: module }) => Application.instanceInitializer( module )
);


export default Application.create( modules, {
	rootElement: "body",

	toString() { return "App"; }
});
