const defaultOptions = { allowNull: true };


export default {
	name: "boolean-transform",

	initialize( application ) {
		const BooleanTransform = application.lookup( "transform:boolean" );

		BooleanTransform.reopen({
			deserialize( serialized ) {
				return this._super( serialized, defaultOptions );
			},

			serialize( deserialized ) {
				return this._super( deserialized, defaultOptions );
			}
		});
	}
};
