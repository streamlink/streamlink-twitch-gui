import PolymorphicFragmentSerializer
	from "data/models/-serializers/polymorphic-fragment-serializer";
import { namespaces, typeKey } from "./fragment";


export default class SettingsHotkeysNamespaceSerializer extends PolymorphicFragmentSerializer {
	models = namespaces;
	modelBaseName = "settings-hotkeys-namespace";
	typeKey = typeKey;
}
