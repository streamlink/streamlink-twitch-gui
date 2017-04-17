import {
	UnableToOpenError,
	NoStreamsFoundError,
	NoPlayerError,
	Warning
} from "./errors";


const reUnable    = /^error: Unable to open URL: /;
const reNoStreams = /^error: No streams found on this URL: /;
const reHosting   = /^hosting was disabled by command line option$/;
const reNoPlayer  = /^error: Failed to start player: /;
const reNoPlayer2 = /^error: The default player \(.+\) does not seem to be installed\./;
const reWarnInsec = /InsecurePlatformWarning: A true SSLContext object is not available\./;


// we need a common error parsing function for stdout and stderr, because
// error messages get printed to stdout instead of stderr sometimes
export default function parseError( data ) {
	if ( reUnable.test( data ) ) {
		return new UnableToOpenError();
	} else if ( reNoStreams.test( data ) || reHosting.exec( data ) ) {
		return new NoStreamsFoundError();
	} else if ( reNoPlayer.test( data ) || reNoPlayer2.test( data ) ) {
		return new NoPlayerError();
	} else if ( reWarnInsec.test( data ) ) {
		return new Warning( data );
	}
}
