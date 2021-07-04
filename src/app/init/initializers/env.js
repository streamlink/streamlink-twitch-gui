import { locales as localesConfig } from "config";


const { default: defaultLocale } = localesConfig;


export default {
	name: "env",

	initialize( application ) {
		const ENV = {
			intl: {
				defaultLocale,
				defaultFallback: defaultLocale
			}
		};

		application.register( "config:environment", ENV );
	}
};
