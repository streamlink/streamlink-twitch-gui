const varApplication = "Application";
const initMethods = {
	"initializer": "initializer",
	"instance-initializer": "instanceInitializer"
};
const initializers = Object.keys( initMethods );


function buildRequire( path, exportName ) {
	return `require("${path}")${exportName ? `["${exportName}"]` : ""}`;
}

function buildNamespace( modules ) {
	const lines = modules
		.filter( ({ type }) => !initializers.includes( type ) )
		.map( ({ name, path, exportName }) =>
			`${name}: ${buildRequire( path, exportName )}`
		);

	return `{\n\t${lines.join( ",\n\t" )}\n}`;
}

function buildInitializers( modules ) {
	const lines = modules
		.filter( ({ type }) => initializers.includes( type ) )
		.map( ({ path, type, exportName }) =>
			`${varApplication}.${initMethods[ type ]}(${buildRequire( path, exportName )});`
		);

	return `const {${varApplication}} = require("ember").default;\n\n\n${lines.join( "\n" )}`;
}


module.exports = function( modules ) {
	const initializers = buildInitializers( modules );
	const namespace = buildNamespace( modules );

	return `${initializers}\n\n\nexport default ${namespace};`;
};
