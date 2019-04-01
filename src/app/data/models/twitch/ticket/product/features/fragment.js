import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { array } from "ember-data-model-fragments/attributes";


export default Fragment.extend({
	base_emoticon_set_id: attr( "number" ),
	emoticon_set_ids: array( "number" ),
	tier: attr( "string" )
});
