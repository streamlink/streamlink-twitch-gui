/**
 * Use a static list of Twitch stream qualities recognized by livestreamer:
 * source, high, medium, low, mobile
 *
 * Specific qualities are available in addition to the old named qualities:
 * 144p30, 240p30, 360p30, 480p30, 540p30, 720p30, 720p60, 1080p30, 1080p60
 * https://blog.twitch.tv/-705404e95cc2
 * https://twitter.com/Twitch/status/781969741053243392
 *
 * Always add an ultimate fallback quality to the end of the list. This is needed for
 * watching unpartnered channels that are only available in source quality when a
 * different default quality has been selected by the user.
 */
export default [
	// Source
	// Use "source" and all quality names in descending order in case "source" is unavailable,
	// but use "best" before using any static quality names. This is necessary because of a bug
	// in Livestreamer, which doesn't match quality names with a refresh rate and is therefore
	// unable to detect 1080p60 as the best quality.
	{
		id: "source",
		label: "Source",
		value: "source,best,1080p60,720p60,1080p30,720p30,540p30,480p30,360p30,240p30,144p30"
	},

	// High
	// 720p30 @ ~1.25 Mbit/s
	// use the same framerate first and exclude high framerates
	{
		id: "high",
		label: "High",
		value: "high,720p30,540p30,best"
	},

	// Medium
	// 480p30 @ ~0.75 Mbit/s
	// use the same bitrate first
	{
		id: "medium",
		label: "Medium",
		value: "medium,480p30,540p30,worst"
	},

	// Low
	// 360p30 @ ~0.50 Mbit/s
	// use the same resolution first
	{
		id: "low",
		label: "Low",
		value: "low,360p30,240p30,144p30,mobile,worst"
	},

	// Audio
	// no fallback qualities
	{
		id: "audio",
		label: "Audio only",
		value: "audio"
	}
];
