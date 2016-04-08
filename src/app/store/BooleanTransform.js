define([
	"EmberData"
], function(
	DS
) {

	return DS.BooleanTransform.reopen({
		deserialize: function( serialized ) {
			return serialized === null
				? null
				: this._super( serialized );
		},

		serialize: function( deserialized ) {
			return deserialized === null
				? null
				: this._super( deserialized );
		}
	});

});
