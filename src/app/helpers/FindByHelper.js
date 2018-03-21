import { helper } from "@ember/component/helper";


export default helper( ([ arr, key, value ]) => arr.findBy( key, value ) );
