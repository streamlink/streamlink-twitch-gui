import PolymorphicFragmentSerializer from "data/models/-mixins/polymorphic-fragment-serializer";
import { providers, typeKey } from "./fragment";


export default PolymorphicFragmentSerializer.extend({
	models: providers,
	modelBaseName: "settings-chat-provider",
	typeKey
});
