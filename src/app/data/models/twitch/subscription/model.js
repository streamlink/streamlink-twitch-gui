import attr from "ember-data/attr";
import Model from "ember-data/model";
import { name } from "utils/decorators";


@name( "kraken/users/:user_id/subscriptions" )
export default class TwitchSubscription extends Model {
	//@belongsTo( "twitch-channel" )
	//channel;
	//@attr( "boolean" )
	//is_gift;
	//@attr( "number or string???" )
	//sender;
	//@attr( "string" )
	//sub_plan;
	@attr( "date" )
	created_at;
}
