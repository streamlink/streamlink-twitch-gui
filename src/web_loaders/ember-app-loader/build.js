const varApplication = "Application";
const initMethods = {
	"initializer": "initializer",
	"instance-initializer": "instanceInitializer"
};
const initializers = Object.keys( initMethods );


function sortNamespace( { name: a }, { name: b } ) {
	return a < b ? -1 : a > b ? 1 : 0;
}

function buildNamespace( modules ) {
	const lines = modules
		// ignore filtered modules
		.filter( Boolean )
		.filter( ({ type }) => !initializers.includes( type ) )
		// and make sure that no duplicates exist
		.sort( sortNamespace )
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

	return `{\n\t${lines.join( ",\n\t" )}\n}`;
}

function buildInitializers( modules ) {
	const lines = modules
		// ignore filtered modules
		.filter( Boolean )
		.filter( ({ type }) => initializers.includes( type ) )
		.map( ({ path, type, exportName }) => {
			const moduleImport = `require("${path}")${exportName ? `["${exportName}"]` : ""}`;

			return `${varApplication}.${initMethods[ type ]}(${moduleImport});`;
		});

	return `const {${varApplication}} = require("ember").default;\n\n\n${lines.join( "\n" )}`;
}


module.exports = function( modules ) {
	const initializers = buildInitializers( modules );
	const namespace = buildNamespace( modules );

	return `${initializers}\n\n\nexport default ${namespace};`;
};
