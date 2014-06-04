module.exports = {
	options			: {
		build_dir		: "build",
		version			: "<%= package.config['node-webkit-version'] %>",
		keep_nw			: false,
		win				: false,
		mac				: false,
		linux32			: false,
		linux64			: false
	},
	win				: {
		options			: { win: true },
		src				: "build/tmp/**"
	},
	mac				: {
		options			: { mac: true },
		src				: "build/tmp/**"
	},
	linux32			: {
		options			: { linux32: true },
		src				: "build/tmp/**"
	},
	linux64			: {
		options			: { linux64: true },
		src				: "build/tmp/**"
	}
};
