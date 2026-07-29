import { module, test } from "qunit";

import NotificationData from "services/notification/data";


module( "services/notification/data", function() {
	test( "Get message as string", function( assert ) {
		const singleMessageData = new NotificationData({
			title: "foo",
			message: "bar",
			icon: "/path/to/icon.png",
			click: null,
			settings: null
		});

		assert.strictEqual(
			singleMessageData.getMessageAsString(),
			"bar",
			"Gets single message"
		);

		const multiMessageData = new NotificationData({
			title: "foo",
			message: [
				{
					title: "bar",
					message: "baz"
				},
				{
					title: "qux",
					message: "quux"
				}
			],
			icon: "/path/to/icon.png",
			click: null,
			settings: null
		});

		assert.strictEqual(
			multiMessageData.getMessageAsString(),
			"bar, qux",
			"Gets multi message from titles"
		);
	});

	test( "Icon URI", function( assert ) {
		const singleMessageData = new NotificationData({
			title: "foo",
			message: "bar",
			icon: "/path/to/icon.png",
			click: null,
			settings: null
		});

		assert.strictEqual(
			singleMessageData.getIconAsFileURI(),
			"file:///path/to/icon.png",
			"Gets correct icon URI"
		);
	});

	test( "Decode HTML entities in message", function( assert ) {
		const singleMessageData = new NotificationData({
			title: "foo",
			message: "This message&#39;s text will be decoded &amp; properly displayed",
			icon: "/path/to/icon.png",
			click: null,
			settings: null
		});

		assert.strictEqual(
			singleMessageData.message,
			"This message's text will be decoded & properly displayed",
			"Decodes single message data"
		);

		const multiMessageData = new NotificationData({
			title: "foo",
			message: [
				{
					title: "bar",
					message:
						"Typisch fiese Kater w&uuml;rden V&ouml;gel blo&szlig; zum Jux qu&auml;len"
				},
				{
					title: "baz",
					message: "&#x1F600;"
				}
			],
			icon: "/path/to/icon.png",
			click: null,
			settings: null
		});

		assert.propEqual(
			multiMessageData.message,
			[
				{
					title: "bar",
					message: "Typisch fiese Kater würden Vögel bloß zum Jux quälen"
				},
				{
					title: "baz",
					message: "😀"
				}
			],
			"Decodes multi message data"
		);
	});
});
