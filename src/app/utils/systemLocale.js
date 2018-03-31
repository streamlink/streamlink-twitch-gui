import { locales as localesConfig } from "config";
import { window } from "nwjs/Window";


const kLocales = Object.keys( localesConfig.locales );
// test whether one of the system locales is supported
const locales = window.navigator.languages
	.map( tag => tag.toLowerCase() )
	.filter( tag => kLocales.includes( tag ) );

// choose the first supported system locale, or use the defined default one instead
const locale = locales.length
	? locales[0]
	: localesConfig.default;


export default locale;
