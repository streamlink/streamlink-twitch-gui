import Mixin from "@ember/object/mixin";


export default Mixin.create({
	_isFocused() {
		return this.element.ownerDocument.activeElement === this.element;
	}
});
