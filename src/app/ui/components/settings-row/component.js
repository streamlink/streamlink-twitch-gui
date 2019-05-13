import Component from "@ember/component";
import { computed } from "@ember/object";
import { classNames, layout } from "@ember-decorators/component";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@classNames( "settings-row-component" )
export default class SettingsRowComponent extends Component {
	static positionalParams = [ "title", "description" ];

	strNewLine = "\n";
	substitutionsExpanded = false;

	documentationUrl = null;

	@computed( "substitutions" )
	get _substitutions() {
		/** @type {Substitution[]} substitutions */
		const substitutions = this.substitutions;

		if ( !Array.isArray( substitutions ) ) {
			return [];
		}

		return substitutions.map( substitution => ({
			variable: `{${substitution.vars[0]}}`,
			description: substitution.description
		}) );
	}
}
