var TemplateCompiler = require( "../../bower_components/ember/ember-template-compiler" );
var precompile = TemplateCompiler.precompile;


module.exports = function( source ) {
	var precompiled = precompile( source ).toString();

	return "module.exports=require('Ember').default.HTMLBars.template(" + precompiled + ");";
};
