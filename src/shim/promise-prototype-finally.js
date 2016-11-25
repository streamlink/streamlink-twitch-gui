// based on https://github.com/tc39/proposal-promise-finally
// license: MIT

function speciesConstructor( O, defaultConstructor ) {
	let C = typeof O.constructor === "undefined"
		? defaultConstructor
		: O.constructor;
	let S = C[ Symbol.species ];

	return S === null
		? defaultConstructor
		: S;
}

/**
 * @param {Function?} onFinally
 * @returns {Promise}
 */
Promise.prototype.finally = function( onFinally ) {
	let handler = typeof onFinally === "function"
		? onFinally
		: function() {};
	let C;

	let newPromise = Promise.prototype.then.call(
		// throw if IsPromise(this) is not true
		this,
		x => new C( resolve => resolve( handler() ) ).then( () => x ),
		e => new C( resolve => resolve( handler() ) ).then( () => { throw e; } )
	);
	// throws if SpeciesConstructor throws
	C = speciesConstructor( this, Promise );

	return newPromise;
};
