import Component from "@ember/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { classNames, layout, tagName } from "@ember-decorators/component";
import { main as mainConfig } from "config";
import { isDebug } from "nwjs/debug";
import template from "./template.hbs";
import "./styles.less";


const { "display-name": displayName } = mainConfig;


@layout( template )
@tagName( "header" )
@classNames( "title-bar-component" )
export default class TitleBarComponent extends Component {
	/** @type {AuthService} */
	@service auth;
	/** @type {NotificationService} */
	@service notification;
	/** @type {NwjsService} */
	@service nwjs;
	/** @type {RouterService} */
	@service router;
	/** @type {SettingsService} */
	@service settings;
	/** @type {StreamingService} */
	@service streaming;

	displayName = displayName;
	isDebug = isDebug;

	@action
	goto() {
		this.router.transitionTo( ...arguments );
	}

	@action
	homepage() {
		this.router.homepage();
	}

	@action
	nwjsAction( method ) {
		this.nwjs[ method ]();
	}
}
