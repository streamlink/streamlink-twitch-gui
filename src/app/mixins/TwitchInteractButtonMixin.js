define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var setP = Ember.setProperties;
	var alias = Ember.computed.alias;
	var and = Ember.computed.and;
	var bool = Ember.computed.bool;

	function switchProperty( key ) {
		return function() {
			var property = get( this, "isLoading" )
				? key + "Loading"
				: get( this, "isSuccessful" )
					? key + "Success"
					: key + "Failure";
			return get( this, property );
		}.property( "isLoading", "isSuccessful" );
	}

	return Ember.Mixin.create({
		auth : Ember.inject.service(),
		store: Ember.inject.service(),

		isVisible   : alias( "isValid" ),
		isValid     : and( "model", "auth.session.isLoggedIn" ),
		isSuccessful: bool( "record" ),

		model : null,
		record: null,
		id    : alias( "model.id" ),
		name  : alias( "id" ),

		isLoading: false,
		isLocked : false,

		"class" : switchProperty( "class" ),
		icon    : switchProperty( "icon" ),
		title   : switchProperty( "title" ),
		iconanim: true,

		classLoading: "btn-info",
		classSuccess: "btn-success",
		classFailure: "btn-danger",
		iconLoading : "fa-question",
		iconSuccess : "fa-check",
		iconFailure : "fa-times",
		titleLoading: "",
		titleSuccess: "",
		titleFailure: "",


		_checkRecord: function() {
			var modelName = this.modelName;
			if ( !modelName ) { return; }

			if ( get( this, "isLoading" ) ) { return; }

			var isValid = get( this, "isValid" );
			var id      = get( this, "id" );
			var record  = get( this, "record" );
			if ( !isValid || !id || record !== null ) { return; }

			setP( this, {
				record   : null,
				isLoading: true,
				isLocked : true
			});

			var store = get( this, "store" );
			return store.findExistingRecord( modelName, id )
				.catch(function() { return false; })
				.then(function( record ) {
					setP( this, {
						record   : record,
						isLoading: false,
						isLocked : false
					});
				}.bind( this ) );
		}.observes( "isValid", "model" ).on( "willInsertElement" )
	});

});
