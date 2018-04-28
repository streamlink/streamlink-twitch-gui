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
 *
 * Update:
 * Qualities are now also listed without a framerate description.
 */
export default [
	// Source
	// Use "source" and all quality names in descending order in case "source" is unavailable.
	// Use "best" right after high framerate qualities, because those are most likely the "source".
	// This is necessary because of a bug in Livestreamer, which doesn't match quality names with a
	// refresh rate and is therefore unable to detect 1080p60 as the best quality.
	{
		id: "source",
		quality: [
			"source",
			"1080p60",
			"900p60",
			"720p60",
			"best",
			"1080p30",
			"900p",
			"720p30",
			"540p30",
			"480p30",
			"360p30",
			"240p30",
			"160p30"
		].join( "," )
	},

	// High
	// 720p30 @ ~1.25 Mbit/s
	// Use the same framerate first and exclude high framerates.
	// Include qualities without framerates, so they have higher priority than best at the end.
	{
		id: "high",
		quality: [
			"high",
			"720p30",
			"720p",
			"540p30",
			"540p",
			"best"
		].join( "," )
	},

	// Medium
	// 480p30 @ ~0.75 Mbit/s
	// Use the same bitrate first.
	// Include qualities without framerates, so they have higher priority than worst at the end.
	{
		id: "medium",
		quality: [
			"medium",
			"480p30",
			"480p",
			"540p30",
			"540p",
			"worst"
		].join( "," )
	},

	// Low
	// 360p30 @ ~0.50 Mbit/s
	// Use the same resolution first.
	// Include qualities without framerates, so they have higher priority than worst at the end.
	{
		id: "low",
		quality: [
			"low",
			"360p30",
			"360p",
			"240p30",
			"240p",
			"160p30",
			"160p",
			"worst"
		].join( "," )
	},

	// Audio
	// No fallback qualities.
	{
		id: "audio",
		quality: [
			"audio",
			"audio_only"
		].join( "," )
	}
];
