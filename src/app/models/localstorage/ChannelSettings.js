import {
	attr,
	Model
} from "EmberData";
import Settings from "models/localstorage/Settings";


const attributes = [
	"quality",
	"gui_openchat",
	"notify_enabled"
];

// Can't add attributes on runtime (init()) due to ember's caching policy, so do it this way
const attrs = {};
attributes.forEach(function( name ) {
	const meta = Settings.metaForProperty( name );
	if ( !meta || !meta.isAttribute ) { return; }
	attrs[ name ] = attr( meta.type, { defaultValue: null } );
});


export default Model.extend( attrs ).reopenClass({
	toString() { return "ChannelSettings"; }
});
