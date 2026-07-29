import PolymorphicFragmentSerializer from "data/models/-mixins/polymorphic-fragment-serializer";
import { namespaces, typeKey } from "./fragment";


export default PolymorphicFragmentSerializer.extend({
	models: namespaces,
	modelBaseName: "settings-hotkeys-namespace",
	typeKey
});
