
module.exports = function( content ) {
	const { config, themesVarName, themesPath } = this.query;

	const themes = require( config );
	this.addDependency( config );

	const imports = themes.themes
		.map( theme => `@import "${themesPath}${theme}";` )
		.join( "\n" );

	const list = themes.themes
		.map( theme => `~"${theme}"` )
		.join( ", " );

	return `${content}\n\n\n${imports}\n@${themesVarName}: ${list};`;
};
