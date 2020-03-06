import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export default Fragment.extend({
	disabled: attr( "boolean", { defaultValue: false } ),
	code: attr( "string", { defaultValue: null } ),
	altKey: attr( "boolean", { defaultValue: false } ),
	ctrlKey: attr( "boolean", { defaultValue: false } ),
	metaKey: attr( "boolean", { defaultValue: false } ),
	shiftKey: attr( "boolean", { defaultValue: false } )
});
