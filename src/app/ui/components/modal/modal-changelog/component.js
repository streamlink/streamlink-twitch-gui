import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { classNames, layout } from "@ember-decorators/component";
import { main as mainConfig } from "config";
import ModalDialogComponent from "../modal-dialog/component";
import template from "./template.hbs";


const { urls: { "release": releaseUrl } } = mainConfig;


@layout( template )
@classNames( "modal-changelog-component" )
export default class ModalChangelogComponent extends ModalDialogComponent {
	/** @type {NwjsService} */
	@service nwjs;
	/** @type {VersioncheckService} */
	@service versioncheck;

	/** @type {VersioncheckService} */
	modalContext;

	@action
	async showChangelog( success, failure ) {
		try {
			const { version } = this.modalContext;
			this.nwjs.openBrowser( releaseUrl, { version } );
			await success();
			this.send( "close" );
		} catch ( err ) /* istanbul ignore next */ {
			await failure( err );
		}
	}
}
