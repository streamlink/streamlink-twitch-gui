import { Controller } from "ember";
import Settings from "models/localstorage/Settings";
import { isDarwin } from "utils/node/platform";


export default Controller.extend({
	Settings,
	isDarwin
});
