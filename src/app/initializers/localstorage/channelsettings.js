import { qualityIdToName } from "./utils";
import qualities from "models/stream/qualities";


export default function( channelsettings ) {
	qualityIdToName( channelsettings, qualities );
}
