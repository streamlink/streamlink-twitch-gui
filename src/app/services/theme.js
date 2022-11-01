import { set, observer } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import { themes as themesConfig } from "config";


const { themes, system: systemThemes, prefix } = themesConfig;


export default Service.extend( /** @class ThemeService */ {
	document: service( "-document" ),
	settings: service(),

	systemTheme: null,
	customTheme: null,

	initialize() {
		// calling this in `init` won't trigger the observer of systemTheme when it gets set
		this._checkSystemColorScheme();
	},

	/**
	 * @param {string|null} theme
	 */
	setTheme( theme ) {
		const customTheme = themes.includes( theme )
			? theme
			: null;
		set( this, "customTheme", customTheme );
	},

	/**
	 * Query registered color schemes until one matches and update the systemTheme property.
	 * Add listener to matching query which re-checks color schemes once it doesn't match anymore.
	 */
	_checkSystemColorScheme() {
		const window = this.document.defaultView;
		for ( const [ scheme, theme ] of Object.entries( systemThemes ) ) {
			let mql = window.matchMedia( `(prefers-color-scheme: ${scheme})` );
			if ( !mql.matches ) { continue; }
			let listener = e => {
				if ( e.matches ) { return; }
				mql.removeEventListener( "change", listener );
				mql = listener = null;
				this._checkSystemColorScheme();
			};
			mql.addEventListener( "change", listener );
			set( this, "systemTheme", theme );
			return;
		}
		// use the default theme if none actually matches (probably unnecessary)
		set( this, "systemTheme", systemThemes[ "no-preference" ] );
	},

	/**
	 * Apply theme class name to the documentElement
	 */
	_applyTheme: observer( "settings.content.gui.theme", "systemTheme", "customTheme", function() {
		let { theme } = this.settings.content.gui;

		if ( this.customTheme ) {
			theme = this.customTheme;
		}
		if ( !theme || !themes.includes( theme ) ) {
			theme = "system";
		}
		if ( theme === "system" ) {
			theme = this.systemTheme;
		}

		const classList = this.document.documentElement.classList;
		classList.forEach( name => {
			if ( name.startsWith( prefix ) ) {
				classList.remove( name );
			}
		});
		classList.add( `${prefix}${theme}` );
	})
});
