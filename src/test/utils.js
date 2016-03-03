define( [ "Ember" ], function( Ember ) {

	var run = Ember.run;
	var reWhiteSpace = /\s+/g;


	function runAppend( view ) {
		run( view, "appendTo", "#qunit-fixture" );
	}

	function runDestroy( destroyed ) {
		if ( destroyed ) {
			run( destroyed, "destroy" );
		}
	}

	function getOutput( component, stripWhiteSpace ) {
		var text = component.$().text();
		return stripWhiteSpace
			? text.replace( reWhiteSpace, "" )
			: text;
	}

	function buildOwner( properties ) {
		var Owner = Ember.Object.extend( Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, {
			init: function() {
				this._super.apply( this, arguments );
				var registry = new Ember.Registry( this._registryOptions );
				this.__registry__  = registry;
				this.__container__ = registry.container({ owner: this });
			}
		});

		return Owner.create( properties || {} );
	}


	return {
		runAppend : runAppend,
		runDestroy: runDestroy,
		getOutput : getOutput,
		buildOwner: buildOwner
	};

});
