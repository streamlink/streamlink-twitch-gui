import Substitution from "utils/parameters/Substitution";
import t from "translation-key";


/** @type {Substitution[]} */
export default [
	new Substitution(
		[ "name", "channel", "channelname" ],
		"stream.channel.display_name",
		t`settings.player.args.substitutions.channel`
	),
	new Substitution(
		[ "status", "title" ],
		"stream.channel.status",
		t`settings.player.args.substitutions.status`
	),
	new Substitution(
		[ "game", "gamename" ],
		"stream.stream.game",
		t`settings.player.args.substitutions.game`
	),
	new Substitution(
		"delay",
		"stream.stream.delay",
		t`settings.player.args.substitutions.delay`
	),
	new Substitution(
		[ "online", "since", "created" ],
		"stream.stream.created_at",
		t`settings.player.args.substitutions.created`
	),
	new Substitution(
		[ "viewers", "current" ],
		"stream.stream.viewers",
		t`settings.player.args.substitutions.viewers`
	),
	new Substitution(
		[ "views", "overall" ],
		"stream.channel.views",
		t`settings.player.args.substitutions.views`
	)
];
