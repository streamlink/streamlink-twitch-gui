import { BooleanTransform } from "EmberData";


export default BooleanTransform.reopen({
	deserialize( serialized ) {
		return serialized === null
			? null
			: this._super( serialized );
	},

	serialize( deserialized ) {
		return deserialized === null
			? null
			: this._super( deserialized );
	}
});
