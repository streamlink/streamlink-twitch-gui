const { posix: { sep } } = require( "path" );
const { TYPES, COLLECTIONS, GROUPS } = require( "./module-unification" );


const { hasOwnProperty } = {};
const reRemoveFileEnding = /\.\w+$/g;
const reDash2Camel = /(?:^|-)(.)/g;


function getSegments( files ) {
	return files.map( path => ({
		path,
		segments: path.replace( reRemoveFileEnding, "" ).split( sep )
	}) );
}


function getModuleName( segments, noNestedNames, suffix ) {
	if ( noNestedNames ) {
		segments = [ segments[ segments.length - 1 ] ];
	}

	const name = segments
		.map( segment => segment.replace( reDash2Camel, ( _, c ) => c.toUpperCase() ) )
		.join( "" );

	return `${name}${suffix}`;
}


module.exports = function parse( files, getModuleExports ) {
	return getSegments( files ).map( ({ path, segments }) => {
		// strip private modules/collections
		if ( segments.some( segment => segment.startsWith( "-" ) ) ) {
			return false;
		}

		// find the associated module collection
		let collectionName;
		const prefix = segments.shift();
		if ( !hasOwnProperty.call( GROUPS, prefix ) ) {
			collectionName = prefix;
		} else {
			if ( segments.length < 2 ) {
				return false;
			}
			collectionName = segments.shift();
			const collections = GROUPS[ prefix ];
			if ( !collections.includes( collectionName ) ) {
				return false;
			}
		}

		// don't include module if it doesn't belong into one of the supported collections
		if ( !hasOwnProperty.call( COLLECTIONS, collectionName ) ) {
			return false;
		}

		const collection = COLLECTIONS[ collectionName ];
		const end = segments[ segments.length - 1 ];

		// is module an explicit type?
		if ( hasOwnProperty.call( TYPES, end ) ) {
			// check if the type is supported by the collection
			if ( !collection.types.includes( end ) ) {
				return false;
			}
			const type = end;
			const { suffix } = TYPES[ type ];
			const name = getModuleName(
				segments.slice( 0, -1 ),
				collection.noNestedNames,
				suffix
			);

			// module is an explicit type
			// validate its exports
			return getModuleExports( path ).then( exportNames => {
				// module has to be a commonJS module or a es6 module with at least a default export
				if ( exportNames.length && !exportNames.includes( "default" ) ) {
					throw new Error( `Invalid export of module: ${path}` );
				}

				return {
					name,
					type,
					path,
					exportName: !exportNames.length
						? null
						: "default"
				};
			});

		} else {
			// module is not an explicit type
			// check its exports and guess its type (async)
			return getModuleExports( path ).then( exportNames => {
				// does it have a default export or is it not an es-module?
				if ( !exportNames.length || exportNames.includes( "default" ) ) {
					// then it is the collection's default type
					const type = collection.defaultType;
					const { suffix } = TYPES[ type ];
					const name = getModuleName(
						segments,
						collection.noNestedNames,
						suffix
					);

					return {
						name,
						type,
						path,
						exportName: !exportNames.length
							? null
							: "default"
					};
				}

				const types = collection.types.filter( type => exportNames.includes( type ) );
				if ( types.length !== 1 ) {
					throw new Error( `Invalid export of module: ${path}` );
				}

				const type = types[0];
				const name = getModuleName(
					segments,
					collection.noNestedNames,
					TYPES[ type ].suffix
				);

				return {
					name,
					type,
					path,
					exportName: type
				};
			});
		}
	});
};
