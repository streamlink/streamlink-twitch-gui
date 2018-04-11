import { get } from "@ember/object";
import UserIndexRoute from "../index/route";
import InfiniteScrollOffsetMixin from "ui/routes/-mixins/routes/infinite-scroll/offset";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default UserIndexRoute.extend( InfiniteScrollOffsetMixin, RefreshRouteMixin, {
	itemSelector: ".stream-item-component",
	modelName: "twitchStreamHosted",

	async model() {
		const records = await this._super();
		await Promise.all( records
			.mapBy( "target" )
			.uniqBy( "id" )
			.map( async streamPromise => {
				const stream = streamPromise.content;
				if ( get( stream, "isLoading" ) ) {
					await streamPromise;
				} else {
					await stream.reload();
				}
				await preload( stream, "preview.mediumLatest" );
			})
		);

		return records;
	}
});
