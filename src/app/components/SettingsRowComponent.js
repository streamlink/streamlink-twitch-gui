import Ember from "Ember";
import layout from "templates/components/SettingsRowComponent.hbs";


var get = Ember.get;


/**
 * @param {Substitution[]} substitutions
 * @returns {Array}
 */
function getSubstitutionsList( substitutions ) {
	if ( !( substitutions instanceof Array ) ) { return []; }

	return substitutions.map(function( substitution ) {
		/** @type {string[]} */
		var vars = substitution.vars;
		vars = vars.map(function( name ) {
			return "{" + name + "}";
		});

		return {
			variable   : vars[0],
			description: substitution.description
		};
	});
}


export default Ember.Component.extend({
	layout,

	classNames: [ "settings-row-component" ],

	strNewLine: "\n",
	substitutionsExpanded: false,

	documentationUrl: null,

	_substitutions: function() {
		var substitutions = get( this, "substitutions" );
		return getSubstitutionsList( substitutions );
	}.property( "substitutions" )

}).reopenClass({
	positionalParams: [ "title", "description" ]
});
