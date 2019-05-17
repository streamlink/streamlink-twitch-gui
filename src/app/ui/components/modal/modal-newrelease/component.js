import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { classNames, layout } from "@ember-decorators/component";
import ModalDialogComponent from "../modal-dialog/component";
import template from "./template.hbs";


@layout( template )
@classNames( "modal-newrelease-component" )
export default class ModalNewreleaseComponent extends ModalDialogComponent {
	/** @type {NwjsService} */
	@service nwjs;
	/** @type {VersioncheckService} */
	@service versioncheck;

	/** @type {VersioncheckService} */
	modalContext;

	@action
	async download( success, failure ) {
		try {
			this.nwjs.openBrowser( this.modalContext.release.html_url );
			await success();
			this.send( "ignore" );
		} catch ( err ) /* istanbul ignore next */ {
			await failure( err );
		}
	}

	@action
	ignore() {
		this.modalContext.ignoreRelease();
		this.send( "close" );
	}
}
