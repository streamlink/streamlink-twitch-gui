import { helper as h } from "@ember/component/helper";


export const helper = h( params => params.some( value => value ) );
