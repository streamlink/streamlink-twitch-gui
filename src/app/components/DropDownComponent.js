define([
	"Ember",
	"Selecter",
	"text!templates/components/dropdown.html.hbs"
], function(
	Ember,
	Selecter,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( layout ),
		tagName: "select",

		classNameBindings: [ "class" ],
		attributeBindings: [ "disabled" ],

		content : function() { return []; }.property(),
		value   : null,
		disabled: false,

		optionValuePath: "id",
		optionLabelPath: "label",

		action: null,

		didInsertElement: function() {
			this._super();

			// TODO: remove Selecter dependency

			var classnames = [].slice.call( this.element.classList )
				.without( "ember-view" )
				.without( "ember-select" );
			classnames.unshift( "custom" );

			this.$().selecter({
				customClass: classnames.join( " " ),
				cover: true
			});
		},

		_valueChangedObserver: function() {
			var content = get( this, "content" );
			var path    = get( this, "optionValuePath" );
			var value   = get( this, "value" );

			if ( !content.findBy( path, value ) ) {
				return;
			}

			// update the element's value
			this.element.value = value;
			this.$().selecter( "refresh" );

			this.sendAction( "action", value );
		}.observes( "value" ),

		change: function() {
			var index   = this.element.selectedIndex;
			var content = get( this, "content" );
			var path    = get( this, "optionValuePath" );
			var value   = get( content[ index ], path );
			set( this, "value", value );
		}
	});

});
