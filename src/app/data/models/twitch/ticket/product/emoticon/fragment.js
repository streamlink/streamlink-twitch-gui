import { computed } from "@ember/object";
import { equal } from "@ember/object/computed";
import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export default Fragment.extend({
	regex: attr( "string" ),
	regex_display: attr( "string" ),
	state: attr( "string" ),
	url: attr( "string" ),

	isActive: equal( "state", "active" ),

	title: computed( "regex", "regex_display", function() {
		return this.regex_display || this.regex;
	})
});
