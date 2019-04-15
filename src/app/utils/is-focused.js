export default function isFocused( element ) {
	return element.ownerDocument.activeElement === element;
}
