import { compileTemplate } from "ember-i18n/addon";
import missingMessage from "ember-i18n/addon/utils/i18n/missing-message";


// dynamically import locales data
const importLocales = require.context(
	"locales",
	true,
	// fix sourcemap issue by using \x2F instead of /
	/^.\x2F[a-z]{2,}(-[a-z]{2,})?\x2F([\w-]+\.yml|config\.js)$/
);


function getImports( regEx, callback ) {
	for ( const key of importLocales.keys() ) {
		const match = regEx.exec( key );
		if ( !match ) { continue; }
		const imported = importLocales( key );
		callback( imported, match );
	}
}


export default {
	name: "i18n",

	initialize( application ) {
		const i18nService = application.lookup( "service:i18n" );

		// register ember-i18n stuff
		application.register( "util:i18n/compile-template", compileTemplate );
		application.register( "util:i18n/missing-message", missingMessage );

		const translations = new Map();
		const ensureTranslationObject = locale => {
			if ( !translations.has( locale ) ) {
				translations.set( locale, {} );
			}
		};

		// import all locale configs and register them
		getImports( /^.\/([^\/]+)\/config\.js$/, ( { default: imported }, [ , locale ] ) => {
			ensureTranslationObject( locale );
			application.register( `locale:${locale}/config`, imported );
		});

		// import all translation namespaces and build a translation object for each locale
		getImports( /^.\/([^\/]+)\/([\w-]+)\.yml$/, ( imported, [ , locale, namespace ] ) => {
			ensureTranslationObject( locale );
			translations.get( locale )[ namespace ] = imported;
		});

		// register locale translation objects and add them to the i18n service
		for ( const [ locale, translation ] of translations ) {
			application.register( `locale:${locale}/translations`, translation );
			i18nService.addTranslations( locale, translation );
		}
	}
};
