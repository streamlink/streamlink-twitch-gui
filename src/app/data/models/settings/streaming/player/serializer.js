import PolymorphicFragmentSerializer from "data/models/-mixins/polymorphic-fragment-serializer";
import { players, typeKey } from "./fragment";


export default PolymorphicFragmentSerializer.extend({
	models: players,
	modelBaseName: "settings-streaming-player",
	typeKey
});
