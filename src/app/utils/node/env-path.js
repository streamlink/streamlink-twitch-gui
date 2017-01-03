import { delimiter } from "path";

export const paths = ( process.env.PATH || process.env.path || "." ).split( delimiter );
