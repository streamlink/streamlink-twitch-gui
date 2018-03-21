import { helper } from "@ember/component/helper";
import Moment from "moment";


export default helper( params => new Moment( params[0] ).format( String( params[1] ) ) );
