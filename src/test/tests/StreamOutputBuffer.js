import QUnit from "QUnit";
import StreamOutputBuffer from "utils/StreamOutputBuffer";


	QUnit.module( "StreamOutputBuffer", {} );


	QUnit.test( "Single line output", function( assert ) {

		assert.expect( 10 );

		var text;

		function getSingleLine( line, idx, lines ) {
			assert.strictEqual( lines.length, 1 );
			assert.strictEqual( idx, 0 );
			assert.strictEqual( line, text );
			assert.strictEqual( lines[ idx ], text );
		}

		var buffer = new StreamOutputBuffer( getSingleLine );

		text = "foo";
		buffer( text + "\r\n" );
		assert.strictEqual( buffer.getBuffer(), "", "Buffer is empty" );

		text = "bar";
		buffer( text + "\r\n" );
		assert.strictEqual( buffer.getBuffer(), "", "Buffer is empty" );

	});


	QUnit.test( "Multiple lines in one data chunk", function( assert ) {

		assert.expect( 5 );

		function getLine( line, idx, lines ) {
			assert.deepEqual( lines, [ "foo", "bar" ] );
			assert.strictEqual( line, idx === 0 ? "foo" : "bar" );
		}

		var buffer = new StreamOutputBuffer( getLine );
		buffer( "foo\r\nbar\r\n" );
		assert.strictEqual( buffer.getBuffer(), "", "Buffer is empty" );

	});


	QUnit.test( "Buffer incomplete lines", function( assert ) {

		assert.expect( 2 * 2 + 3 );

		var step = 0;

		function getLine( line, idx, lines ) {
			assert.strictEqual( lines.length, 1 );
			if ( step === 0 ) {
				assert.strictEqual( line, "foo", "Return first line" );
			} else {
				assert.strictEqual( line, "barbaz", "Return now completed line" );
			}
		}

		var buffer = new StreamOutputBuffer( getLine );
		buffer( "foo\r\nbar" );
		assert.strictEqual( buffer.getBuffer(), "bar", "Buffer contains incomplete line" );
		++step;

		buffer( "baz" );
		assert.strictEqual( buffer.getBuffer(), "barbaz", "Second incompl. line added to buffer" );

		buffer( "\r\n" );
		assert.strictEqual( buffer.getBuffer(), "", "Buffer is now empty again" );

	});


	QUnit.test( "Buffer size", function( assert ) {

		var buffer1 = new StreamOutputBuffer( { maxBuffSize: 1 }, function() {} );
		assert.throws(function() {
			buffer1( "foo\r\n" );
		}, Error, "Buffer size limit exceeded" );

		var buffer2 = new StreamOutputBuffer( { maxBuffSize: 3 }, function() {} );
		buffer2( "foo" );
		assert.strictEqual( buffer2.getBuffer(), "foo" );
		assert.throws(function() {
			buffer2( "bar\r\n" );
		}, Error, "Buffer size limit exceeded" );

	});


	QUnit.test( "Custom line delimiter", function( assert ) {

		assert.expect( 6 );

		function getLine( line, idx, lines ) {
			assert.strictEqual( lines.length, 3 );
			if ( idx === 0 ) {
				assert.strictEqual( line, "foo" );
			} else if ( idx === 1 ) {
				assert.strictEqual( line, "bar" );
			} else {
				assert.strictEqual( line, "baz" );
			}
		}

		var buffer = new StreamOutputBuffer( { delimiter: "|" }, getLine );
		buffer( "foo|bar|baz|" );

	});
