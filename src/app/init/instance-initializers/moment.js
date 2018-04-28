import { get } from "@ember/object";
import { addObserver } from "@ember/object/observers";
import Moment from "moment";


// load MomentJS locales (filtered by locale config, see ContextReplacementPlugin in webpack config)
const localesContext = require.context(
	"moment/locale",
	false,
	/^\.\x2F[a-z]{2,}(-[a-z]{2,})?\.js$/i
);
localesContext.keys().forEach( key => localesContext( key ) );


export default {
	name: "moment",
	after: "i18n",

	initialize( application ) {
		const i18n = application.lookup( "service:i18n" );

		addObserver( i18n, "locale", () => {
			const locale = get( i18n, "locale" ).toLowerCase();
			Moment.locale( locale );
		});
	}
};
