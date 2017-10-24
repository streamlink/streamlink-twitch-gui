import {
	attr,
	Model
} from "ember-data";
import Settings from "models/localstorage/Settings";
import SettingsStreaming from "models/localstorage/Settings/streaming";


const attributes = {
	quality: SettingsStreaming,
	gui_openchat: Settings,
	notify_enabled: Settings
};

// Can't add attributes on runtime (init()) due to ember's caching policy, so do it this way
const properties = Object.keys( attributes )
	.reduce( ( obj, name ) => {
		const meta = attributes[ name ].metaForProperty( name );
		if ( meta && meta.isAttribute ) {
			obj[ name ] = attr( meta.type, { defaultValue: null } );
		}
		return obj;
	}, {} );


export default Model.extend( properties ).reopenClass({
	toString() { return "ChannelSettings"; }
});
