import attr from "ember-data/attr";
import Model from "ember-data/model";
import { name } from "utils/decorators";


@name( "Window" )
export default class Window extends Model {
	@attr( "number", { defaultValue: null } )
	x;
	@attr( "number", { defaultValue: null } )
	y;
	@attr( "number", { defaultValue: null } )
	width;
	@attr( "number", { defaultValue: null } )
	height;
	@attr( "boolean", { defaultValue: false } )
	maximized;
}
