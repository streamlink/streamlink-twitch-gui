define([
	"Ember",
	"gui/selectable",
	"gui/smoothscroll"
], function(
	Ember,
	guiSelectable,
	guiSmoothscroll
) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var reTheme = /^theme-/;

	return Ember.Component.extend({
		metadata: Ember.inject.service(),
		settings: Ember.inject.service(),

		tagName: "body",
		classNames: [ "wrapper", "vertical" ],

		themes: alias( "metadata.config.themes" ),
		theme: alias( "settings.content.gui_theme" ),

		themeObserver: function() {
			var themes = get( this, "themes" );
			var theme  = get( this, "theme" );

			if ( themes.indexOf( theme ) === -1 ) {
				theme = "default";
			}

			var list = document.documentElement.classList;
			[].forEach.call( list, function( name ) {
				if ( !reTheme.test( name ) ) { return; }
				list.remove( name );
			});

			list.add( "theme-" + theme );
		}.observes( "themes", "theme" ).on( "init" ),

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		},

		didInsertElement: function() {
			guiSelectable();
			guiSmoothscroll();

			var controller = this.container.lookup( "controller:application" );

			document.documentElement.addEventListener( "keyup", function( e ) {
				var f5    = e.keyCode === 116;
				var ctrlR = e.keyCode ===  82 && e.ctrlKey === true;
				if ( f5 || ctrlR ) {
					controller.send( "refresh" );
				}
			}, false );
		}
	});

});
