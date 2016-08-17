var PATH = require( "path" );
var themes = require( "../config/themes.json" );

var themesVarName = "THEMES";
var themesPath = "themes/";


module.exports = function( content ) {
	this.cacheable();
	this.addDependency( PATH.resolve( "..", "config", "themes.json" ) );

	var imports = themes.themes
		.map(function( theme ) {
			return "@import \"" + themesPath + theme + "\";";
		})
		.join( "\n" );

	var list = themes.themes
		.map(function( theme ) {
			return "~\"" + theme + "\"";
		})
		.join( ", " );

	return [
		content,
		"\n\n\n",
		imports,
		"\n",
		"@",
		themesVarName,
		": ",
		list,
		";"
	].join( "" );
};
