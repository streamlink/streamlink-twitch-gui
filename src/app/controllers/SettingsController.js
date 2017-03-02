import {
	get,
	set,
	computed,
	inject,
	observer,
	Controller
} from "Ember";
import {
	main,
	files,
	streamprovider,
	players,
	langs,
	themes
} from "config";
import RetryTransitionMixin from "mixins/RetryTransitionMixin";
import { playerSubstitutions } from "models/stream/parameters";
import qualities from "models/stream/qualities";
import Settings from "models/localstorage/Settings";
import {
	isSupported as isNotificationSupported,
	show as showNotification
} from "utils/Notification";
import * as platform from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";
import { delimiter } from "path";


const { alias, equal } = computed;
const { service } = inject;
const { "display-name": displayName } = main;
const { icons: { big: bigIcon } } = files;
const { providers } = streamprovider;
const { themes: themesList } = themes;

const kPlayers = Object.keys( players );


function settingsAttrMeta( attr, prop ) {
	return computed(function() {
		return Settings.metaForProperty( attr ).options[ prop ];
	});
}


export default Controller.extend( RetryTransitionMixin, {
	chat: service(),
	modal: service(),
	settings: service(),

	isAnimated: false,

	qualities,
	Settings,
	platform,


	hlsLiveEdgeDefault: settingsAttrMeta( "hls_live_edge", "defaultValue" ),
	hlsLiveEdgeMin    : settingsAttrMeta( "hls_live_edge", "min" ),
	hlsLiveEdgeMax    : settingsAttrMeta( "hls_live_edge", "max" ),

	hlsSegmentThreadsDefault: settingsAttrMeta( "hls_segment_threads", "defaultValue" ),
	hlsSegmentThreadsMin    : settingsAttrMeta( "hls_segment_threads", "min" ),
	hlsSegmentThreadsMax    : settingsAttrMeta( "hls_segment_threads", "max" ),

	retryStreamsDefault: settingsAttrMeta( "retry_streams", "defaultValue" ),
	retryStreamsMin    : settingsAttrMeta( "retry_streams", "min" ),
	retryStreamsMax    : settingsAttrMeta( "retry_streams", "max" ),

	retryOpenDefault: settingsAttrMeta( "retry_open", "defaultValue" ),
	retryOpenMin    : settingsAttrMeta( "retry_open", "min" ),
	retryOpenMax    : settingsAttrMeta( "retry_open", "max" ),

	streamproviders: providers,
	streamprovidersDropDown: computed(function() {
		return Object.keys( providers )
			.filter(function( key ) {
				// exclude unsupported providers
				return providers[ key ][ "exec" ][ platform.platform ];
			})
			.map(function( key ) {
				return {
					id: key,
					label: providers[ key ][ "label" ]
				};
			});
	}),
	streamproviderName: computed( "model.streamprovider", function() {
		let streamprovider = get( this, "model.streamprovider" );

		return providers[ streamprovider ][ "name" ];
	}),

	// filter platform dependent player parameters
	players: computed(function() {
		let playerlist = {};

		Object.keys( players ).forEach( playername => {
			let playerObj = Object.assign( {}, players[ playername ] );
			playerObj.params = playerObj.params
				.map( param => {
					param = Object.assign( {}, param );
					if ( param.args instanceof Object ) {
						param.args = param.args[ platform.platform ];
					}
					return param;
				})
				.filter( param => !!param.args );
			playerlist[ playername ] = playerObj;
		});

		return playerlist;
	}),

	playerPresets: computed(function() {
		let presetList = kPlayers
			.filter(function( key ) {
				return players[ key ][ "exec" ][ platform.platform ]
				    && players[ key ][ "disabled" ] !== true;
			})
			.map(function( key ) {
				return {
					id: key,
					label: players[ key ][ "name" ]
				};
			});

		presetList.unshift({
			id   : "default",
			label: "No preset"
		});

		return presetList;
	}),

	playerPlaceholder: computed( "model.player_preset", function() {
		let preset = get( this, "model.player_preset" );
		if ( preset === "default" || !players[ preset ] ) {
			return "Leave blank for default player";
		}
		let exec = players[ preset ][ "exec" ][ platform.platform ];
		if ( !exec ) {
			return "Leave blank for default location";
		}
		if ( Array.isArray( exec ) ) {
			exec = exec.join( `${delimiter} ` );
		}
		return exec;
	}),

	playerPresetDefaultAndPlayerEmpty: computed(
		"model.player_preset",
		"model.player.default.exec",
		function() {
			let preset = get( this, "model.player_preset" );
			let player = get( this, "model.player" );

			return preset === "default" && !get( player, "default.exec" );
		}
	),


	substitutionsPlayer: playerSubstitutions,
	substitutionsChatCustom: alias( "chat.substitutionsCustom" ),


	chatMethods: computed(function() {
		return Settings.chat_methods.filter(function( method ) {
			return !method.disabled;
		});
	}),

	isChatMethodDefault: equal( "model.chat_method", "default" ),
	isChatMethodMSIE   : equal( "model.chat_method", "msie" ),
	isChatMethodCustom : equal( "model.chat_method", "custom" ),
	isChatMethodChatty : equal( "model.chat_method", "chatty" ),


	themes: computed(function() {
		return themesList.map(function( theme ) {
			return {
				id   : theme,
				label: theme.substr( 0, 1 ).toUpperCase() + theme.substr( 1 )
			};
		});
	}),


	hasTaskBarIntegration: equal( "model.gui_integration", 1 ),
	hasBothIntegrations  : equal( "model.gui_integration", 3 ),

	_minimizeObserver: observer( "model.gui_integration", function() {
		var int    = get( this, "model.gui_integration" );
		var min    = get( this, "model.gui_minimize" );
		var noTask = ( int & 1 ) === 0;
		var noTray = ( int & 2 ) === 0;

		// make sure that disabled options are not selected
		if ( noTask && min === 1 ) {
			set( this, "model.gui_minimize", 2 );
		}
		if ( noTray && min === 2 ) {
			set( this, "model.gui_minimize", 1 );
		}

		// enable/disable buttons
		set( Settings, "minimize.1.disabled", noTask );
		set( Settings, "minimize.2.disabled", noTray );
	}),


	languages: computed(function() {
		return Object.keys( langs )
			.filter(function( code ) {
				return !langs[ code ].disabled;
			})
			.map(function( code ) {
				return {
					id  : code,
					lang: langs[ code ][ "lang" ]
				};
			});
	}),


	// filter available notification providers
	notifyProvider: function() {
		return Settings.notify_provider.filter(function( item ) {
			return isNotificationSupported( item.value );
		});
	}.property(),


	actions: {
		apply( success, failure ) {
			var modal  = get( this, "modal" );
			var model  = get( this, "settings.content" );

			get( this, "model" ).applyChanges( model );

			model.save()
				.then( success, failure )
				.then( modal.closeModal.bind( modal, this ) )
				.then( this.retryTransition.bind( this ) )
				.catch( model.rollbackAttributes.bind( model ) );
		},

		discard( success ) {
			var modal = get( this, "modal" );
			get( this, "model" ).discardChanges();
			Promise.resolve()
				.then( success )
				.then( modal.closeModal.bind( modal, this ) )
				.then( this.retryTransition.bind( this ) );
		},

		cancel() {
			set( this, "previousTransition", null );
			get( this, "modal" ).closeModal( this );
		},

		checkLanguages( all ) {
			var filters = get( this, "model.gui_langfilter" );
			Object.keys( filters.content ).forEach(function( key ) {
				set( filters, key, all );
			});
		},

		testNotification( success, failure ) {
			let provider = get( this, "model.notify_provider" );
			let icon = platform.isWin && !DEBUG
				? resolvePath( "%NWJSAPPPATH%", bigIcon )
				: resolvePath( bigIcon );
			let notification = {
				title: displayName,
				message: "This is a test notification",
				icon: icon
			};
			showNotification( provider, notification, provider !== "auto" )
				.then( success, failure )
				.catch(function() {});
		}
	}
});
