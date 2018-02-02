import { Mixin } from "ember";


export default Mixin.create({
	_isFocused() {
		return this.element.ownerDocument.activeElement === this.element;
	}
});
