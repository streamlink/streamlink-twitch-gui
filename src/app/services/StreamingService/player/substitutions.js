import Substitution from "utils/parameters/Substitution";


/** @type {Substitution[]} */
export default [
	new Substitution(
		[ "name", "channel", "channelname" ],
		"stream.channel.display_name",
		"Channel name"
	),
	new Substitution(
		[ "status", "title" ],
		"stream.channel.status",
		"Channel status text"
	),
	new Substitution(
		[ "game", "gamename" ],
		"stream.stream.game",
		"Name of the game being played"
	),
	new Substitution(
		"delay",
		"stream.stream.delay",
		"Additional stream delay in seconds"
	),
	new Substitution(
		[ "online", "since", "created" ],
		"stream.stream.created_at",
		"Online since"
	),
	new Substitution(
		[ "viewers", "current" ],
		"stream.stream.viewers",
		"Number of current viewers"
	),
	new Substitution(
		[ "views", "overall" ],
		"stream.channel.views",
		"Total number of views"
	)
];
