import { helper as h } from "@ember/component/helper";
import Moment from "moment";


export const helper = h( ([ time, format ]) => new Moment( time ).format( String( format ) ) );
