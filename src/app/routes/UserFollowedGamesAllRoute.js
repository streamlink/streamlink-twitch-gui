import UserFollowedGamesIndexRoute from "./UserFollowedGamesIndexRoute";


export default UserFollowedGamesIndexRoute.extend({
	modelName: "twitchGameFollowed",
	modelPreload: "game.box.large"
});
