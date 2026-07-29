import { helper as h } from "@ember/component/helper";


export const helper = h( ( params, hash ) => params[ hash.index ] );
