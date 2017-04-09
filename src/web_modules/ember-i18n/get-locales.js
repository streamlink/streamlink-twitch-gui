import { A as EmberNativeArray } from "@ember/array";
import { locales as localesConfig } from "config";


const locales = new EmberNativeArray( Object.keys( localesConfig[ "locales" ] ) );


// module replacement for ember-i18n/addon/utils/get-locals.js for avoiding requirejs imports
// will be imported by the I18NService and set as `locales` computed property
export default () => locales;
