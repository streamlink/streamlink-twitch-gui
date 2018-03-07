const { isArray } = Array;
const reName = /^(Key|Digit)/;
const separator = "+";


/**
 * @param {I18nService} i18n
 * @param {string} title
 * @param {Object} hotkey
 * @param {string} hotkey.code
 * @param {boolean} hotkey.ctrlKey
 * @param {boolean} hotkey.shiftKey
 * @param {boolean} hotkey.altKey
 * @returns {string}
 */
export default function( i18n, title, hotkey ) {
	const modifiers = [];

	if ( hotkey.ctrlKey ) {
		modifiers.push( i18n.t( "hotkeys.modifiers.ctrl" ).toString() );
	}
	if ( hotkey.shiftKey ) {
		modifiers.push( i18n.t( "hotkeys.modifiers.shift" ).toString() );
	}
	if ( hotkey.altKey ) {
		modifiers.push( i18n.t( "hotkeys.modifiers.alt" ).toString() );
	}

	const keyCode = isArray( hotkey.code )
		? hotkey.code[0]
		: hotkey.code;
	const key = reName.test( keyCode )
		? keyCode.replace( reName, "" )
		: i18n.t( `hotkeys.keys.${keyCode}` ).toString();
	const modifier = modifiers.length
		? `${modifiers.join( separator )}${separator}`
		: "";

	return `[${modifier}${key}] ${title}`;
}
