import PolymorphicFragmentSerializer from "store/PolymorphicFragmentSerializer";
import {
	players,
	typeKey
} from "./streamingPlayer";


export default PolymorphicFragmentSerializer.extend({
	models: players,
	modelBaseName: "settings-streaming-player",
	typeKey
});
