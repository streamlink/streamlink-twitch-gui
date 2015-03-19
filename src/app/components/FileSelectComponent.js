define([
	"ember",
	"text!templates/components/fileselect.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),
		tagName: "div",
		classNames: [ "input-group" ],

		value: "",
		placeholder: "",
		disabled: false,

		_createInput: function() {
			var self = this;
			self._input = Ember.$( "<input>" ).addClass( "hidden" ).attr({
				type: "file",
				tabindex: -1
			}).change(function() {
				if ( !this.value.length ) { return; }
				self.set( "value", this.value );
				this.files.clear();
			});
		}.on( "init" ),

		actions: {
			"selectfile": function() {
				if ( !this.get( "disabled" ) ) {
					this._input.click();
				}
			}
		}
	});

});
