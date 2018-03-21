import { locales as localesConfig } from "config";


export default {
	name: "env",

	initialize( application ) {
		const ENV = {
			i18n: {
				defaultLocale: localesConfig[ "default" ]
			}
		};

		application.register( "config:environment", ENV );
	}
};
