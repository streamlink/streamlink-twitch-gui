import Component from "@ember/component";
import { get, set } from "@ember/object";
import { next, scheduleOnce } from "@ember/runloop";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend({
	layout,

	error: false,

	onLoad() {},
	onError() {},

	didInsertElement() {
		this._super( ...arguments );

		const setError = () => scheduleOnce( "afterRender", () => {
			set( this, "error", true );
		});

		if ( !get( this, "src" ) ) {
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
});
