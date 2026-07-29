import Substitution from "utils/parameters/Substitution";
import t from "translation-key";


/** @type {Substitution[]} */
export default [
	new Substitution(
		[ "name", "channel", "channelname" ],
		"stream.stream.user_name",
		t`settings.player.args.substitutions.channel`
	),
	new Substitution(
		[ "status", "title" ],
		"stream.stream.title",
		t`settings.player.args.substitutions.status`
	),
	new Substitution(
		[ "game", "gamename" ],
		"stream.stream.game_name",
		t`settings.player.args.substitutions.game`
	),
	new Substitution(
		"delay",
		"stream.stream.channel.delay",
		t`settings.player.args.substitutions.delay`
	),
	new Substitution(
		[ "online", "since", "created" ],
		"stream.stream.started_at",
		t`settings.player.args.substitutions.created`
	),
	new Substitution(
		[ "viewers", "current" ],
		"stream.stream.viewer_count",
		t`settings.player.args.substitutions.viewers`
	)
];
