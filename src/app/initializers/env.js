import { locales as localesConfig } from "config";


const { default: defaultLocale } = localesConfig;


export default {
	name: "env",

	initialize( application ) {
		const ENV = {
			i18n: {
				defaultLocale,
				defaultFallback: defaultLocale
			}
		};

		application.register( "config:environment", ENV );
	}
};
