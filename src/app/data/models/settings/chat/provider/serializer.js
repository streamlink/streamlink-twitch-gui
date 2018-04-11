import PolymorphicFragmentSerializer from "store/PolymorphicFragmentSerializer";
import { providers, typeKey } from "./fragment";


export default PolymorphicFragmentSerializer.extend({
	models: providers,
	modelBaseName: "settings-chat-provider",
	typeKey
});
