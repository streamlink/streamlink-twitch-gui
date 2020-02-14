module.exports = function() {
	return process.env.SOURCE_DATE_EPOCH
		? new Date( parseInt( process.env.SOURCE_DATE_EPOCH, 10 ) * 1000 )
		: new Date();
};
