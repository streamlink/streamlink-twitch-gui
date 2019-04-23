import PolymorphicFragmentSerializer
	from "data/models/-serializers/polymorphic-fragment-serializer";
import { players, typeKey } from "./fragment";


export default class SettingsStreamingPlayerSerializer extends PolymorphicFragmentSerializer {
	models = players;
	modelBaseName = "settings-streaming-player";
	typeKey = typeKey;
}
