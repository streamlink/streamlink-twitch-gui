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
	after: "intl",

	initialize( application ) {
		const intl = application.lookup( "service:intl" );

		const updateMomentLocale = () => {
			const locale = intl.locale[0].toLowerCase();
			Moment.locale( locale );
		};

		updateMomentLocale();
		addObserver( intl, "locale", updateMomentLocale );
	}
};
