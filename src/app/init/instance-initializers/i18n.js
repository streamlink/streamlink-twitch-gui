import { compileTemplate } from "ember-i18n/addon";
import missingMessage from "ember-i18n/addon/utils/i18n/missing-message";
import { locales as localesConfig } from "config";


// dynamically import locales data
const importLocales = require.context(
	"locales",
	true,
	// fix sourcemap issue by using \x2F instead of /
	/^.\x2F[a-z]{2,}(-[a-z]{2,})?\x2F([\w-]+\.yml|config\.js)$/
);


const { locales } = localesConfig;


export default {
	name: "i18n",

	initialize( application ) {
		const i18nService = application.lookup( "service:i18n" );

		// register ember-i18n stuff
		application.register( "util:i18n/compile-template", compileTemplate );
		application.register( "util:i18n/missing-message", missingMessage );

		// create translation objects
		const translations = new Map();
		for ( const [ locale ] of Object.entries( locales ) ) {
			translations.set( locale, {} );
		}

		const reTranslations = /^.\/([^\/]+)\/([\w-]+)\.yml$/;
		for ( const key of importLocales.keys() ) {
			// only import translations from known locales
			const match = reTranslations.exec( key );
			if ( !match ) { continue; }
			const [ , locale, namespace ] = match;
			if ( !translations.has( locale ) ) { continue; }

			// import translation namespaces
			translations.get( locale )[ namespace ] = importLocales( key );
		}

		for ( const [ locale ] of Object.entries( locales ) ) {
			// import locale config and register it
			const { default: config } = importLocales( `./${locale}/config.js` );
			application.register( `locale:${locale}/config`, config );

			// register locale translations and add them to the i18n service
			const translation = translations.get( locale );
			application.register( `locale:${locale}/translations`, translation );
			i18nService.addTranslations( locale, translation );
		}
	}
};
