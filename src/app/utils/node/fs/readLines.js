import StreamOutputBuffer from "utils/StreamOutputBuffer";
import { createReadStream } from "fs";


/**
 * @param {String} file
 * @param {(Function|RegExp)} validate
 * @param {Number?} max
 * @param {Number?} expire
 * @returns {Promise}
 */
export default function readLines( file, validate = null, max = 1, expire = 3000 ) {
	let filestream;
	let timeout;

	if ( !validate ) {
		validate = line => ([ line ]);
	} else if ( validate instanceof RegExp ) {
		const reValidate = validate;
		validate = line => reValidate.exec( line );
	}

	return new Promise( ( resolve, reject ) => {
		let index = 0;
		let data = [];
		let buffer = [];

		const onEnd = () => {
			const valid = data.some( item => item );
			( valid ? resolve : reject )([ data, buffer ]);
		};

		const onLine = line => {
			if ( index < max ) {
				buffer.push( line );
				data.push( validate( line, index ) );
			}
			if ( ++index >= max ) {
				onEnd();
			}
		};

		/** @type ReadStream */
		filestream = createReadStream( file );
		filestream.once( "error", reject );
		filestream.once( "end", onEnd );
		filestream.on( "data", new StreamOutputBuffer( onLine ) );

		timeout = setTimeout( () => reject( new Error( "Timeout" ) ), expire );
	})
		.finally( () => {
			clearTimeout( timeout );
			filestream.close();
		});
}
