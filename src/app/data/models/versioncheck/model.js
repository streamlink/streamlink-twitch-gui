import attr from "ember-data/attr";
import Model from "ember-data/model";
import { name } from "utils/decorators";


@name( "Versioncheck" )
export default class Versioncheck extends Model {
	@attr( "string", { defaultValue: "" } )
	version;
	@attr( "number", { defaultValue: 0 } )
	checkagain;
	@attr( "number", { defaultValue: 0 } )
	showdebugmessage;
}
