import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { attribute, className, tagName } from "@ember-decorators/component";
import t from "translation-key";


@tagName( "div" )
export default class SelectableTextComponent extends Component {
	/** @type {NwjsService} */
	@service nwjs;

	@className
	class = "";

	@attribute( "data-selectable" )
	selectable = true;

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		const selection = window.getSelection();
		const selected = selection.toString();

		if ( !selected.length && event.target.tagName === "A" ) { return; }

		this.nwjs.contextMenu( event, [{
			label: [ t`contextmenu.copy-selection` ],
			enabled: selected.length,
			click() {
				this.nwjs.clipboard.set( selected );
			}
		}] );
	}
}
