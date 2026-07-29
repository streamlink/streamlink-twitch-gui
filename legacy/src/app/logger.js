/* global DEBUG, DEVELOPMENT */
/* eslint-disable no-console */
import Ember from "ember";
import { argv } from "nwjs/argv";
import Logger from "utils/Logger";


const { logDebug, logError } = new Logger( "Application" );


const onError = async ( type, err, debug ) => {
	if ( DEVELOPMENT || DEBUG ) {
		console.error( type, err, debug );
	}
	try {
		await logError( type ? `${type}: ${err}` : err, debug );
	} catch ( e ) {}
};


process.on( "uncaughtException", e => onError( "uncaughtException", e ) );
window.addEventListener( "unhandledrejection", e => onError( e.type, e.reason, e.promise ) );
window.addEventListener( "error", e => onError( "error", e.error ) );
Ember.onerror = e => e && e.name !== "Adapter Error" ? onError( "Ember error", e ) : null;

if ( DEVELOPMENT || DEBUG ) {
	console.debug( argv );
}
// don't log parameters when running a dev build via grunt
if ( !DEVELOPMENT ) {
	logDebug( "Parameters", argv );
}
