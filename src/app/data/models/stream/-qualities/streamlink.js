/**
 * Define a list of stream quality names that matches the old quality names
 * as well as a range of qualities defined by video resolution or video resolution and frame rate.
 *
 * Use Streamlink's `--stream-sorting-excludes` parameter for excluding non matching streams.
 * The `best` quality name alias will select the best quality of the matching ones.
 *
 * Specific qualities are available in addition to the old named qualities:
 * 144p30, 240p30, 360p30, 480p30, 540p30, 720p30, 720p60, 1080p30, 1080p60
 * https://blog.twitch.tv/-705404e95cc2
 * https://twitter.com/Twitch/status/781969741053243392
 *
 * Update:
 * Qualities are now also listed without a framerate description.
 */
export default [
	// Source
	{
		id: "source",
		quality: "best",
		exclude: null
	},

	// High
	{
		id: "high",
		quality: "high,best,best-unfiltered",
		exclude: ">720p30"
	},

	// Medium
	{
		id: "medium",
		quality: "medium,best,best-unfiltered",
		exclude: ">540p30"
	},

	// Low
	{
		id: "low",
		quality: "low,best,best-unfiltered",
		exclude: ">360p30"
	},

	// Audio
	{
		id: "audio",
		quality: "audio,audio_only",
		exclude: null
	}
];
