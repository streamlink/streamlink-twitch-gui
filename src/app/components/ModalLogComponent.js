define([
	"Ember",
	"text!templates/components/modallog.html.hbs"
], function(
	Ember,
	layout
) {

	var scheduleOnce = Ember.run.scheduleOnce;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( layout ),

		tagName: "section",
		classNames: [ "modal-log" ],

		log: function() {
			return [];
		}.property(),

		_logObserver: function() {
			scheduleOnce( "afterRender", this, "scrollToBottom" );
		}.observes( "log.[]" ),

		scrollToBottom: function() {
			var elem = this.element;
			if ( !elem ) { return; }
			elem.scrollTop = Math.max( 0, elem.scrollHeight - elem.clientHeight );
		}.on( "didInsertElement" )
	});

});
