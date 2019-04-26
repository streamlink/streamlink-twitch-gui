import Controller from "@ember/controller";
import { qualities as contentStreamingQuality } from "data/models/stream/model";
import {
	default as SettingsStreams,
	DEFAULT_VODCAST_REGEXP
} from "data/models/settings/streams/fragment";
import { isDarwin } from "utils/node/platform";


const {
	contentName: contentStreamsName,
	info: contentStreamsInfo,
	click: contentStreamsClick
} = SettingsStreams;


export default class SettingsStreamsController extends Controller {
	contentStreamingQuality = contentStreamingQuality;
	contentStreamsName = contentStreamsName;
	contentStreamsInfo = contentStreamsInfo;
	contentStreamsClick = contentStreamsClick;

	DEFAULT_VODCAST_REGEXP = DEFAULT_VODCAST_REGEXP;

	isDarwin = isDarwin;
}
