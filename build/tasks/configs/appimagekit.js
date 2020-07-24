module.exports = {
	options: {
		source: "AppImage/AppImageKit",
		version: "12",
		path: "<%= dir.tmp_appimage %>/<%= appimagekit.options.version %>",
		files: {
			"appimagetool-x86_64.AppImage":
				"d918b4df547b388ef253f3c9e7f6529ca81a885395c31f619d9aaf7030499a13",
			"AppRun-x86_64":
				"e8f44f56bb23e105905850250d9d87fb1a5cf64211ad141b85864b1b7a092332",
			"appimagetool-i686.AppImage":
				"3af6839ab6d236cd62ace9fbc2f86487f0bf104f521d82da6dea4dab8d3ce4ca",
			"AppRun-i686":
				"9b7933e96ed4ad8b4275fd105c9921d95a388519369dcd5ec1249a72cd5c8c85"
		},
		apprun: {
			linux32: "AppRun-i686",
			linux64: "AppRun-x86_64"
		},
		appimagetool: {
			linux32: "appimagetool-i686.AppImage",
			linux64: "appimagetool-x86_64.AppImage"
		}
	}
};
