export class ErrorLog extends Error {
	get name() { return "ErrorLog"; }

	constructor( message, log ) {
		super( message );
		const type = "stdErr";
		this.log = Array.from( log ).map( line => ({ type, line }) );
	}
}

export class VersionError extends Error {
	get name() { return "VersionError"; }

	constructor( version ) {
		super();
		this.version = version;
	}
}

export class NotFoundError extends Error {
	get name() { return "NotFoundError"; }
}

export class UnableToOpenError extends Error {
	get name() { return "UnableToOpenError"; }
}

export class NoStreamsFoundError extends Error {
	get name() { return "NoStreamsFoundError"; }
}

export class NoPlayerError extends Error {
	get name() { return "NoPlayerError"; }
}

export class Warning extends Error {
	get name() { return "Warning"; }
}

export class Aborted extends Error {
	get name() { return "Aborted"; }
}
