import DS from "EmberData";
import AdapterMixin from "store/AdapterMixin";


export default DS.RESTAdapter.extend( AdapterMixin, {
	host: "https://api.github.com",
	namespace: "repos/bastimeyer/livestreamer-twitch-gui"
});
