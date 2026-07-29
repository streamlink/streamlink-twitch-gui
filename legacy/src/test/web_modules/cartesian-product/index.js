const fill = ( A, B ) => [].concat( ...A.map( a => B.map( b => [].concat( a, b ) ) ) );
const cartesian = ( a, b, ...c ) => b ? cartesian( fill( a, b ), ...c ) : a;


export default cartesian;
