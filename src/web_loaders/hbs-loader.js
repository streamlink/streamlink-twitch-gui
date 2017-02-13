const TemplateCompiler = require( "../../bower_components/ember/ember-template-compiler" );
const { precompile } = TemplateCompiler;


module.exports = function( content ) {
	const precompiled = precompile( content ).toString();

	return `module.exports=require('Ember').default.HTMLBars.template(${precompiled});`;
};
