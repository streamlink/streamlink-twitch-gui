import OS from "os";
import PATH from "path";


const reNwjsCacheDirName = /^nw\d+_\d+$/;


function platformfixes() {
	// Fix CWD, which may be somewhere in the OS's temp dir.
	// Caused by NWjs extracting the compressed app content appended to the executable.
	// Fixes #237
	const cwd = process.cwd();

	// add a NWJSAPPPATH env var to the current process
	// will be required by paths pointing to files inside the NWjs app content folder
	if ( !process.env.NWJSAPPPATH ) {
		process.env.NWJSAPPPATH = cwd;
	}

	const tmpdir = OS.tmpdir();
	const relative = PATH.relative( tmpdir, cwd );

	if ( reNwjsCacheDirName.test( relative ) ) {
		try {
			const newCwd = PATH.dirname( process.execPath );
			process.chdir( newCwd );
		} catch ( e ) {}
	}
}


export default platformfixes;
