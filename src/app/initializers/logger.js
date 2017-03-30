import Ember from "Ember";
import argv from "nwjs/argv";
import { isDebug } from "nwjs/debug";
import Logger from "utils/Logger";


const { logDebug, logError } = new Logger( "Application" );


Ember.onerror = err => logError( err );

global.process.on( "uncaughtException", err => {
	if ( isDebug ) {
		/* eslint-disable no-console */
		console.error( err );
	} else {
		logError( err );
	}
});

logDebug( "Parameters", argv );
