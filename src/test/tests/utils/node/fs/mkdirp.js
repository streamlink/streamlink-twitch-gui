import { module, test } from "qunit";
import sinon from "sinon";

import mkdirpInjector from "inject-loader!utils/node/fs/mkdirp";


module( "utils/node/fs/mkdirp", function( hooks ) {
	/** @typedef {Object} TestContextUtilsNodeFsMkdirp */

	hooks.beforeEach( /** @this {TestContextUtilsNodeFsMkdirp} */ function() {
		this.mkdirStub = sinon.stub().callsFake( path => Promise.resolve( path ) );

		/** @type {Function} subject */
		this.subject = mkdirpInjector({
			"fs/promises": {
				mkdir: this.mkdirStub
			}
		})[ "default" ];
	});


	test( "Error", async function( assert ) {
		/** @this {TestContextUtilsNodeFsMkdirp} */
		const err = new Error( "foo" );
		this.mkdirStub.rejects( err );
		await assert.rejects(
			this.subject( "/foo/bar" ),
			err,
			"Rejects with error"
		);
		assert.propEqual(
			this.mkdirStub.args,
			[[ "/foo/bar", { recursive: true } ]],
			"Sets the recursive option to true"
		);
	});

	test( "Simple parameters", async function( assert ) {
		/** @this {TestContextUtilsNodeFsMkdirp} */
		assert.strictEqual(
			await this.subject( "/foo/bar" ),
			"/foo/bar",
			"Returns the created path"
		);
		assert.propEqual(
			this.mkdirStub.args,
			[[ "/foo/bar", { recursive: true } ]],
			"Sets the recursive option to true"
		);
	});

	test( "Mode option", async function( assert ) {
		/** @this {TestContextUtilsNodeFsMkdirp} */
		assert.strictEqual(
			await this.subject( "/foo/bar", { mode: 0o111 } ),
			"/foo/bar",
			"Returns the created path"
		);
		assert.propEqual(
			this.mkdirStub.args,
			[[ "/foo/bar", { recursive: true, mode: 0o111 } ]],
			"Sets the recursive option to true and keeps the mode option"
		);
	});

	test( "Invalid options", async function( assert ) {
		/** @this {TestContextUtilsNodeFsMkdirp} */
		const options = { recursive: false, foo: "bar" };
		assert.strictEqual(
			await this.subject( "/foo/bar", options ),
			"/foo/bar",
			"Returns the created path"
		);
		assert.propEqual(
			this.mkdirStub.args,
			[[ "/foo/bar", { recursive: true, foo: "bar" } ]],
			"Always sets the recursive option to true and keeps other options"
		);
		assert.propEqual(
			options,
			{ recursive: false, foo: "bar" },
			"Doesn't alter the input options properties"
		);
	});
});
