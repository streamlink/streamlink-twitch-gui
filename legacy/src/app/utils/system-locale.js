import { locales as localesConfig } from "config";
import { window } from "nwjs/Window";


const kLocales = Object.keys( localesConfig.locales );
// test whether one of the system locales is supported
const locale = window.navigator.languages
	.map( tag => tag.toLowerCase() )
	.find( tag => kLocales.includes( tag ) )
	// choose the first supported system locale, or use the defined default one instead
	|| localesConfig.default;


export default locale;
