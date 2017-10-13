import QUnit from "qunitjs";
import "qunitjs/qunit/qunit.css";


export default QUnit;

export const config = QUnit.config;

export const module = QUnit.module;
export const only = QUnit.only;
export const test = QUnit.test;
export const todo = QUnit.todo;
export const skip = QUnit.skip;
export const start = QUnit.start;


QUnit.assert.checkSteps = function() {
	this.verifySteps( ...arguments );
	this.clearSteps();
};

QUnit.assert.clearSteps = function() {
	this.test.steps.splice( 0, this.test.steps.length );
};
