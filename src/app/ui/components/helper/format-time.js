import { helper as h } from "@ember/component/helper";
import Moment from "moment";


export const helper = h( params => new Moment( params[0] ).format( String( params[1] ) ) );
