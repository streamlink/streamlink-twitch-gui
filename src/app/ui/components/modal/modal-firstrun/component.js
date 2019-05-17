import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { classNames, layout } from "@ember-decorators/component";
import { main as mainConfig } from "config";
import ModalDialogComponent from "../modal-dialog/component";
import template from "./template.hbs";


@layout( template )
@classNames( "modal-firstrun-component" )
export default class ModalFirstrunComponent extends ModalDialogComponent {
	/** @type {RouterService} */
	@service router;
	/** @type {VersioncheckService} */
	@service versioncheck;

	name = mainConfig[ "display-name" ];

	@action
	settings() {
		this.router.transitionTo( "settings" );
		this.send( "close" );
	}
}
