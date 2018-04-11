import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export default Fragment.extend({
	exec: attr( "string" ),
	params: attr( "string" ),
	pythonscript: attr( "string" )
});
