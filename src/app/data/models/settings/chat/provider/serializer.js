import PolymorphicFragmentSerializer
	from "data/models/-serializers/polymorphic-fragment-serializer";
import { providers, typeKey } from "./fragment";


export default class SettingsChatProviderSerializer extends PolymorphicFragmentSerializer {
	models = providers;
	modelBaseName = "settings-chat-provider";
	typeKey = typeKey;
}
