import missingMessage from "ember-intl/-private/utils/missing-message";


// dynamically import locales data
const importLocales = require.context(
	"locales",
	true,
	// fix sourcemap issue by using \x2F instead of /
	/^.\x2F[a-z]{2,}(-[a-z]{2,})?\x2F[\w-]+\.yml$/
);


function getImports( regEx, callback ) {
	for ( const key of importLocales.keys() ) {
		const match = regEx.exec( key );
		/* istanbul ignore next */
		if ( !match ) { continue; }
		const imported = importLocales( key );
		callback( imported, match );
	}
}


export default {
	name: "intl",

	initialize( application ) {
		/** @type {IntlService} */
		const intlService = application.lookup( "service:intl" );

		// register ember-intl stuff
		application.register( "util:intl/missing-message", missingMessage );

		const translations = new Map();
		const ensureTranslationObject = locale => {
			if ( !translations.has( locale ) ) {
				translations.set( locale, {} );
			}
		};

		// import all translation namespaces and build a translation object for each locale
		getImports( /^.\/([^\/]+)\/([\w-]+)\.yml$/, ( imported, [ , locale, namespace ] ) => {
			ensureTranslationObject( locale );
			translations.get( locale )[ namespace ] = imported;
		});

		// register locale translation objects and add them to the intl service
		for ( const [ locale, translation ] of translations ) {
			application.register( `locale:${locale}/translations`, translation );
			intlService.addTranslations( locale, translation );
		}
	}
};
