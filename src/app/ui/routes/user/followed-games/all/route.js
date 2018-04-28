import UserFollowedGamesIndexRoute from "../index/route";


export default UserFollowedGamesIndexRoute.extend({
	modelName: "twitchGameFollowed",
	modelPreload: "game.box.large"
});
