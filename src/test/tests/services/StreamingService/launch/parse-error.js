import {
	module,
	test
} from "qunit";
import {
	PlayerError,
	UnableToOpenError,
	NoStreamsFoundError,
	HostingError,
	Warning
} from "services/StreamingService/errors";
import parseError from "services/StreamingService/launch/parse-error";


module( "services/StreamingService/parse-error" );


test( "Errors", assert => {

	let error;

	error = parseError( "error: Failed to start player: /foo/bar" );
	assert.ok(
		error instanceof PlayerError,
		"Finds the 'failed to start player' error message"
	);

	error = parseError( "error: The default player (VLC) does not seem to be installed." );
	assert.ok(
		error instanceof PlayerError,
		"Finds the 'missing default player' error message"
	);

	error = parseError( "error: Unable to open URL: foo/bar" );
	assert.ok(
		error instanceof UnableToOpenError,
		"Finds the 'unable to open URL' error message"
	);

	error = parseError( "error: No streams found on this URL: twitch.tv/foo" );
	assert.ok(
		error instanceof NoStreamsFoundError,
		"Finds the 'no streams found on this URL' error message"
	);

	error = parseError( "hosting was disabled by command line option" );
	assert.ok(
		error instanceof HostingError,
		"Finds the 'disabled hosting by command line' error message"
	);

	error = parseError( "InsecurePlatformWarning: A true SSLContext object is not available." );
	assert.ok(
		error instanceof Warning,
		"Finds the 'true SSLContext object InsecurePlatformWarning' warning"
	);

});
