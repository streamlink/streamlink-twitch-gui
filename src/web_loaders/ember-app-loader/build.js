module.exports = function( modules ) {
	function compare( { name: a }, { name: b } ) {
		return a < b ? -1 : a > b ? 1 : 0;
	}

	const lines = modules
		// ignore filtered modules
		.filter( Boolean )
		// and make sure that no duplicates exist
		.sort( compare )
		.map( ( module, idx, modules ) => {
			const next = modules[ idx + 1 ];
			if ( next && next.name === module.name ) {
				throw new Error(
					`Duplicates found for ${module.name}: ${module.path} and ${next.path}`
				);
			}

			return module;
		})
		.map( ({ name, path, exportName }) =>
			`${name}: require("${path}")${exportName ? `["${exportName}"]` : ""}`
		);

	return `module.exports = {\n\t${lines.join( ",\n\t" )}\n};`;
};
