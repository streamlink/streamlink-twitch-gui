const TemplateCompiler = require( "ember-source/dist/ember-template-compiler" );
const { precompile } = TemplateCompiler;


module.exports = function( content ) {
	const precompiled = precompile( content ).toString();

	return `export default require('ember').default.HTMLBars.template(${precompiled});`;
};
