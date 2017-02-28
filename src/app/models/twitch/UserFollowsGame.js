import { Model } from "EmberData";


export default Model.extend().reopenClass({
	toString() { return "api/users/:user_name/follows/games"; }
});
