import { helper as h } from "@ember/component/helper";


export const helper = h( ([ arr, key, value ]) => arr.findBy( key, value ) );
