import UserFollowedGamesIndexRoute from "./UserFollowedGamesIndexRoute";


export default UserFollowedGamesIndexRoute.extend({
	modelName: "twitchGameFollowed",
	preloadPath: "game.box.large"
});
