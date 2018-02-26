import qualitiesLivestreamer from "./livestreamer";
import qualitiesStreamlink from "./streamlink";


const createPresetObj = ( presets, preset ) => {
	presets[ preset.id ] = preset;
	return presets;
};
const qualitiesByIdLivestreamer = qualitiesLivestreamer.reduce( createPresetObj, {} );
const qualitiesByIdStreamlink = qualitiesStreamlink.reduce( createPresetObj, {} );


export {
	qualitiesStreamlink as default,
	qualitiesLivestreamer,
	qualitiesStreamlink,
	qualitiesByIdLivestreamer,
	qualitiesByIdStreamlink
};
