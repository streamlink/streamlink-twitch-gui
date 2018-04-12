import Substitution from "utils/parameters/Substitution";


const base = "settings.player.args.substitutions";


/** @type {Substitution[]} */
export default [
	new Substitution(
		[ "name", "channel", "channelname" ],
		"stream.channel.display_name",
		`${base}.channel`
	),
	new Substitution(
		[ "status", "title" ],
		"stream.channel.status",
		`${base}.status`
	),
	new Substitution(
		[ "game", "gamename" ],
		"stream.stream.game",
		`${base}.game`
	),
	new Substitution(
		"delay",
		"stream.stream.delay",
		`${base}.delay`
	),
	new Substitution(
		[ "online", "since", "created" ],
		"stream.stream.created_at",
		`${base}.created`
	),
	new Substitution(
		[ "viewers", "current" ],
		"stream.stream.viewers",
		`${base}.viewers`
	),
	new Substitution(
		[ "views", "overall" ],
		"stream.channel.views",
		`${base}.views`
	)
];
