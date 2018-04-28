import { module, test } from "qunit";

import {
	PlayerError,
	UnableToOpenError,
	NoStreamsFoundError,
	TimeoutError,
	HostingError,
	Warning
} from "services/streaming/errors";
import parseError from "services/streaming/launch/parse-error";


module( "services/streaming/launch/parse-error" );


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

	error = parseError( "error: Error when reading from stream: Read timeout, exiting" );
	assert.ok(
		error instanceof TimeoutError,
		"Finds the 'read timeout' error message"
	);

	error = parseError( "foo is hosting bar" );
	assert.ok(
		error instanceof HostingError,
		"Finds the 'X is hosting Y' error message"
	);
	assert.strictEqual(
		error.channel,
		"bar",
		"Sets the correct channel property on HostingError"
	);

	error = parseError( "InsecurePlatformWarning: A true SSLContext object is not available." );
	assert.ok(
		error instanceof Warning,
		"Finds the 'true SSLContext object InsecurePlatformWarning' warning"
	);

});
