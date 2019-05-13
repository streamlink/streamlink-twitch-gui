import Component from "@ember/component";
import { set } from "@ember/object";
import { next, scheduleOnce } from "@ember/runloop";
import { layout } from "@ember-decorators/component";
import { on } from "@ember-decorators/object";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
export default class PreviewImageComponent extends Component {
	error = false;

	/* istanbul ignore next */
	onLoad() {}
	/* istanbul ignore next */
	onError() {}

	@on( "didInsertElement" )
	onDidInsertElement() {
		const setError = () => scheduleOnce( "afterRender", () => {
			set( this, "error", true );
		});

		if ( !this.src ) {
			return setError();
		}

		const img = this.element.querySelector( "img" );

		const unbind = () => {
			img.removeEventListener( "error", onError, false );
			img.removeEventListener( "load",  onLoad,  false );
		};

		const onLoad = e => {
			unbind();
			next( () => this.onLoad( e ) );
		};

		const onError = e => {
			unbind();
			setError();
			next( () => this.onError( e ) );
		};

		img.addEventListener( "error", onError, false );
		img.addEventListener( "load",  onLoad,  false );
	}
}
