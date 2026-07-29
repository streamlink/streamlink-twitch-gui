import Application from "@ember/application";
import GlobalsResolver from "@ember/application/globals-resolver";
import { getApplication, setApplication, getResolver, setResolver } from "@ember/test-helpers";
import TemplateCompiler from "ember-source/dist/ember-template-compiler";


const { compile } = TemplateCompiler;
const reWhiteSpace = /\s+/g;


export function getElem( component, selector ) {
	const element = component.element || component._element;
	return selector && selector.length
		? element.querySelector( selector )
		: element;
}

export function getOutput( component, selector ) {
	return getElem( component, selector ).innerText;
}

export function cleanOutput( component, selector ) {
	return getOutput( component, selector ).replace( reWhiteSpace, "" );
}


/**
 * @param {String[]} strings
 * @param {...*} vars
 */
export function hbs( strings, ...vars ) {
	const arr = [ ...strings ];
	const l = vars.length;
	for ( let i = 0; i < l; i++ ) {
		arr.splice( 2 * i + 1, 0, String( vars[ i ] ) );
	}

	return compile( arr.join( "" ) );
}

export function buildResolver( namespace = {} ) {
	return GlobalsResolver.create({
		namespace
	});
}

export function buildFakeApplication( hooks, options, namespace ) {
	if ( !namespace ) {
		namespace = options;
		options = {};
	}

	const methodBefore = options.each ? "beforeEach" : "before";
	const methodAfter = options.each ? "afterEach" : "after";

	let oldApplication;
	let oldResolver;

	hooks[ methodBefore ](function() {
		oldApplication = getApplication();
		oldResolver = getResolver();

		const resolver = buildResolver( namespace );
		const application = Application.extend().create({
			autoboot: false,
			rootElement: "#ember-testing",
			Resolver: {
				create: () => resolver
			}
		});

		setResolver( resolver );
		setApplication( application );
	});

	hooks[ methodAfter ](function() {
		setApplication( oldApplication );
		setResolver( oldResolver );
	});
}
