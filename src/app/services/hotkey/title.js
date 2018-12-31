const { isArray } = Array;
const separator = "+";


/**
 * @param {I18nService} i18n
 * @param {string} title
 * @param {Hotkey} hotkey
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

	const key = isArray( hotkey.key )
		? hotkey.key[0]
		: hotkey.key;
	const keyName = key.length === 1
		? key.toUpperCase()
		: i18n.t( `hotkeys.keys.${key}` ).toString();
	const modifier = modifiers.length
		? `${modifiers.join( separator )}${separator}`
		: "";

	return `[${modifier}${keyName}] ${title}`;
}
