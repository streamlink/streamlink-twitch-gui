import PolymorphicFragmentSerializer from "store/PolymorphicFragmentSerializer";
import { players, typeKey } from "./fragment";


export default PolymorphicFragmentSerializer.extend({
	models: players,
	modelBaseName: "settings-streaming-player",
	typeKey
});
