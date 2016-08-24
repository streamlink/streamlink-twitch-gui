import Ember from "Ember";
import config from "config";
import ModalDialogComponent from "components/modal/ModalDialogComponent";
import Settings from "models/localstorage/Settings";
import openBrowser from "nwjs/openBrowser";
import layout from "templates/components/modal/ModalLivestreamerComponent.hbs";


var get = Ember.get;
var set = Ember.set;
var schedule = Ember.run.schedule;
var readOnly = Ember.computed.readOnly;

var livestreamerDownloadUrl = config.livestreamer[ "download-url" ];


export default ModalDialogComponent.extend({
	livestreamer: Ember.inject.service(),

	layout: layout,
	"class": "modal-livestreamer",

	error : readOnly( "livestreamer.error" ),
	active: readOnly( "livestreamer.active" ),

	qualities: Settings.qualities,
	versionMin: config.livestreamer[ "version-min" ],


	actions: {
		"download": function( success ) {
			if ( livestreamerDownloadUrl ) {
				openBrowser( livestreamerDownloadUrl );
				if ( success instanceof Function ) {
					success();
				}
			}
		},

		"chat": function( channel ) {
			get( this, "livestreamer" ).openChat( channel );
		},

		"abort": function() {
			set( this, "livestreamer.abort", true );
			get( this, "modal" ).closeModal( get( this, "livestreamer" ) );
		},

		"close": function() {
			get( this, "modal" ).closeModal( get( this, "livestreamer" ) );
			schedule( "destroy", this, function() {
				set( this, "livestreamer.active", null );
			});
		},

		"shutdown": function() {
			var active = get( this, "active" );
			if ( active ) {
				active.kill();
			}
			this.send( "close" );
		},

		"toggleLog": function() {
			var active = get( this, "active" );
			if ( active ) {
				active.toggleProperty( "showLog" );
			}
		}
	}
});
