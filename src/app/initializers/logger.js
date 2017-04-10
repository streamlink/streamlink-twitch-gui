/* global DEBUG */
import Ember from "ember";
import argv from "nwjs/argv";
import Logger from "utils/Logger";


const { logDebug, logError } = new Logger( "Application" );


const emberOnError = Ember.onerror;
Ember.onerror = async err => {
	await logError( err );
	emberOnError( err );
};

global.process.on( "uncaughtException", err => {
	if ( DEBUG ) {
		/* eslint-disable no-console */
		console.error( err );
	} else {
		logError( err );
	}
});

// don't log parameters when running a dev build via grunt
if ( !DEBUG ) {
	logDebug( "Parameters", argv );
} else {
	/* eslint-disable no-console */
	console.debug( argv );
}
