import { helper as h } from "@ember/component/helper";


export const helper = h( params => params[0] > params[1] );
