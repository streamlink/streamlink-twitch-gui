import { get, setProperties } from "@ember/object";
import { debounce } from "@ember/runloop";
import SettingsSubmenuRoute from "../-submenu/route";


export default SettingsSubmenuRoute.extend({
	_onBufferChange: null,

	async model() {
		const model = await this._super( ...arguments );

		const controller = this.controllerFor( "settings.languages" );
		const buffer = get( model, "streams.languages" );

		const setLanguageSelection = () => {
			const data = buffer.getContent();
			const num = Object.values( data ).filter( Boolean ).length;
			setProperties( controller, {
				hasAnySelection: num > 0,
				hasSingleSelection: num === 1
			});
		};

		this._onBufferChange = () => debounce( setLanguageSelection, 0 );
		buffer.on( "change", this._onBufferChange );
		setLanguageSelection();

		return model;
	},

	deactivate() {
		const { controller: { model } } = this;
		const buffer = get( model, "streams.languages" );
		buffer.off( "change", this._onBufferChange );
		this._onBufferChange = null;
	}
});
