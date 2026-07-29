import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import sinon from "sinon";

import { observer } from "@ember/object";
import Service from "@ember/service";
import Adapter from "ember-data/adapter";

import searchBarComponentInjector from "inject-loader?config!ui/components/search-bar/component";
import Search from "data/models/search/model";


module( "ui/components/search-bar", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService,
			HotkeyService: Service.extend(),
			RouterService: Service.extend(),
			Search
		})
	});

	/** @typedef {TestContext} TestContextSearchBarComponent */
	/** @this TestContextSearchBarComponent */
	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			global: window
		});
		this.fakeTimer.setSystemTime( 0 );

		setupStore( this.owner );

		let onModelInitResolve = new Function();
		const onModelInitPromise = new Promise( resolve => onModelInitResolve = resolve );
		const { default: FakeSearchBarComponent } = searchBarComponentInjector({
			config: {
				vars: {
					"search-history-size": 3
				}
			}
		});
		this.owner.register( "component:search-bar", FakeSearchBarComponent.extend({
			_modelInitObserver: observer( "model", () => onModelInitResolve() )
		}) );

		this.findAllStub = sinon.stub().resolves([]);
		this.createRecordStub = sinon.stub().resolves();
		this.updateRecordStub = sinon.stub().resolves();
		this.deleteRecordStub = sinon.stub().resolves();
		this.owner.register( "adapter:search", Adapter.extend({
			shouldReloadAll: () => false,
			shouldBackgroundReloadAll: () => false,
			findAll: this.findAllStub,
			createRecord: this.createRecordStub,
			updateRecord: this.updateRecordStub,
			deleteRecord: this.deleteRecordStub
		}) );

		/** @type {DS.Store} */
		this.store = this.owner.lookup( "service:store" );

		/** @return {Search|DS.Model} */
		this.push = ( id, attributes ) => this.store.push({
			data: { id, type: "search", attributes }
		});

		/** @return {Promise<SearchBarComponent>} */
		this.subject = async () => {
			const subject = this.owner.lookup( "component:search-bar" );
			await onModelInitPromise;
			return subject;
		};
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	/** @this TestContextSearchBarComponent */
	test( "addRecord - update existing", async function( assert ) {
		const records = [
			this.push( "1", { filter: "all", query: "foo", date: new Date( 1000 ) }),
			this.push( "2", { filter: "all", query: "bar", date: new Date( 2000 ) })
		];
		this.findAllStub.resolves( records );

		const subject = await this.subject();

		assert.propEqual(
			subject.model.mapBy( "id" ),
			[ "1", "2" ],
			"Has all Search models loaded"
		);
		assert.notOk( this.updateRecordStub.called, "Hasn't called updateRecord yet" );

		this.fakeTimer.tick( 3000 );
		await subject.addRecord( "foo", "all" );
		assert.propEqual(
			this.updateRecordStub.args.flatMap( args => args[2].id ),
			[ "1" ],
			"Updates the first record"
		);
		assert.strictEqual( +records[0].date, 3000, "Updates the date of the first record" );
		assert.notOk( this.deleteRecordStub.called, "Doesn't delete any records" );
		assert.notOk( this.createRecordStub.called, "Doesn't create any records" );
	});

	/** @this TestContextSearchBarComponent */
	test( "addRecord - create new and remove old ones", async function( assert ) {
		const records = [
			this.push( "1", { filter: "all", query: "foo", date: new Date( 1000 ) }),
			this.push( "2", { filter: "all", query: "bar", date: new Date( 4000 ) }),
			this.push( "3", { filter: "all", query: "baz", date: new Date( 3000 ) }),
			this.push( "4", { filter: "all", query: "qux", date: new Date( 2000 ) })
		];
		this.findAllStub.resolves( records );

		const subject = await this.subject();

		assert.propEqual(
			subject.model.mapBy( "id" ),
			[ "1", "2", "3", "4" ],
			"Has all Search models loaded"
		);

		this.fakeTimer.tick( 5000 );
		await subject.addRecord( "foo", "channels" );
		assert.notOk( this.updateRecordStub.called, "Doesn't update any records" );
		assert.propEqual(
			this.deleteRecordStub.args.map( args => args[2].id ),
			[ "1", "4" ],
			"Deletes old records to make space for the new one"
		);
		assert.propEqual(
			this.createRecordStub.args.map( args => args[2].record.toJSON({ includeId: true }) ),
			[
				{
					id: "5",
					filter: "channels",
					query: "foo",
					date: "1970-01-01T00:00:05.000Z"
				}
			],
			"Creates a new record with correct attributes"
		);
		assert.propEqual(
			subject.model.toArray().map( record => record.id ),
			[ "2", "3", "5" ],
			"Component model gets updated accordingly"
		);
		assert.propEqual(
			this.store.peekAll( "search" ).map( record => record.id ),
			[ "2", "3", "5" ],
			"Store only has the right records loaded"
		);
	});
});
