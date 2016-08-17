var TemplateCompiler = require( "../vendor/ember/ember-template-compiler" );
var precompile = TemplateCompiler.precompile;


module.exports = function( source ) {
	if ( this.cacheable ) {
		this.cacheable();
	}

	var precompiled = precompile( source ).toString();

	return "module.exports=require('Ember').HTMLBars.template(" + precompiled + ");";
};
