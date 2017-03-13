import UserFollowedGamesIndexRoute from "routes/UserFollowedGamesIndexRoute";


export default UserFollowedGamesIndexRoute.extend({
	modelName: "twitchGameFollowed",
	preloadPath: "game.box.large"
});
