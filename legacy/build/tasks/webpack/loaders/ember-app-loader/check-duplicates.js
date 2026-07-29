function sort( { name: a }, { name: b } ) {
	return a < b ? -1 : a > b ? 1 : 0;
}


module.exports = function ( modules ) {
	modules
		.slice()
		.sort( sort )
		.forEach( ( module, idx, modules ) => {
			const next = modules[ idx + 1 ];
			if ( next && next.name === module.name ) {
				throw new Error(
					`Duplicates found for ${module.name}: ${module.path} and ${next.path}`
				);
			}
		});

	return modules;
};
