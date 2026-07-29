import { get } from "@ember/object";
import Mixin from "@ember/object/mixin";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll/index";
import { map, toArray } from "ui/routes/-mixins/routes/infinite-scroll/record-array";
import { preload } from "utils/preload";


export default Mixin.create( InfiniteScrollMixin, {
	/** @type {string?} */
	modelName: null,
	/** @type {string?} */
	modelMapBy: null,
	/** @type {Function?} */
	modelItemLoader: null,
	/** @type {(string|string[])?} */
	modelPreload: null,

	/* istanbul ignore next */
	query() {
		return {};
	},

	/* istanbul ignore next */
	preload() {
		return preload( ...arguments );
	},

	async model( params ) {
		const query = Object.assign( {}, params /* istanbul ignore next */ || {}, this.query() );
		let records = await this.store.query( this.modelName, query );

		records = !this.modelMapBy
			? await toArray( records )
			: await map( records, async record => {
				record = get( record, this.modelMapBy );
				if ( !record || !record.promise ) {
					return record;
				}
				try {
					await record.promise;
					return record.content;
				} catch ( e ) /* istanbul ignore next */ {
					return false;
				}
			});

		if ( this.modelItemLoader ) {
			records = await map( records, async record => {
				try {
					await this.modelItemLoader( record );
					return record;
				} catch ( e ) /* istanbul ignore next */ {
					return false;
				}
			});
		}

		return this.modelPreload
			? await this.preload( records, this.modelPreload )
			: /* istanbul ignore next */ records;
	}
});
