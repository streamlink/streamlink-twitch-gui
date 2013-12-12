define(function() {

	return function() {
		var	minSize		= 14,
			minWidth	= 800,
			increase	= 2 / 100;

		calcFontSize();
		window.addEventListener( "resize", calcFontSize, false );

		function calcFontSize() {
			var	elem	= document.documentElement,
				width	= elem.clientWidth,
				size	= width <= minWidth
					? minSize
					: ( minSize + ( increase * ( width - minWidth ) ) ).toFixed( 5 );
			elem.style.fontSize = size + "px";
		}
	};

});
