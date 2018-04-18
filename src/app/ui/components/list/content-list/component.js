import { A as EmberNativeArray } from "@ember/array";
import Component from "@ember/component";
import { get, setProperties } from "@ember/object";
import { readOnly } from "@ember/object/computed";
import { addObserver } from "@ember/object/observers";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [
		"content-list-component"
	],
	classNameBindings: [
		"float::content-list-nofloat"
	],

	content: null,
	compare: null,
	asynchronous: false,

	infiniteScroll: true,
	float: true,


	isFetching: readOnly( "_targetObject.isFetching" ),
	hasFetchedAll: readOnly( "_targetObject.hasFetchedAll" ),
	fetchError: readOnly( "_targetObject.fetchError" ),


	init() {
		this._super( ...arguments );

		setProperties( this, {
			lengthInitial: get( this, "content.length" ),
			length: 0,
			duplicates: new EmberNativeArray(),
			duplicatesMap: new Map()
		});

		addObserver( this, "content.length", this, this.checkDuplicates );
		this.checkDuplicates();
	},


	checkDuplicates() {
		// the previous content.length
		const start = this.length;

		// map content
		const compare = get( this, "compare" );
		let content = get( this, "content" ).slice( start );
		content = compare
			? content.mapBy( compare )
			: content;

		this.length += get( content, "length" );

		if ( !get( this, "asynchronous" ) ) {
			this._checkDuplicates( content, start );

		} else {
			// wait for all potential DS.PromiseObjects to resolve first
			Promise.all( content )
				.then( content => this._checkDuplicates( content, start ) );
		}
	},

	_checkDuplicates( content, start ) {
		const duplicatesMap = this.duplicatesMap;
		const newDuplicates = content.map( item => {
			if ( !duplicatesMap.has( item ) ) {
				duplicatesMap.set( item, true );
				return false;
			} else {
				return true;
			}
		});

		// insert newDuplicates at specific position (function may have been called asynchronously)
		const length = get( content, "length" );
		this.duplicates.replace( start, length, newDuplicates );

		// tell ember to update the yielded duplicates in the template's each loop
		this.notifyPropertyChange( "duplicates" );
	},


	actions: {
		willFetchContent( force ) {
			this.triggerAction({
				action: "willFetchContent",
				actionContext: force
			});
		}
	}

}).reopenClass({
	positionalParams: [
		"content",
		"compare",
		"asynchronous"
	]
});
