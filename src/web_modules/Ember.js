import {} from "JQuery";
import {} from "vendor/ember/ember.debug";


const Ember = window.Ember;


export default Ember;

// property
export const get = Ember.get;
export const set = Ember.set;
export const getWithDefault = Ember.getWithDefault;
export const setProperties = Ember.setProperties;
export const defineProperty = Ember.defineProperty;

// functions
export const getOwner = Ember.getOwner;
export const setOwner = Ember.setOwner;
export const isNone = Ember.isNone;
export const makeArray = Ember.makeArray;
export const merge = Ember.merge;

// libs
export const $ = Ember.$;
export const HTMLBars = Ember.HTMLBars;
export const RSVP = Ember.RSVP;

// collections
export const computed = Ember.computed;
export const inject = Ember.inject;
export const run = Ember.run;

// classes
export const Application = Ember.Application;
export const Binding = Ember.Binding;
export const Component = Ember.Component;
export const Controller = Ember.Controller;
export const EventDispatcher = Ember.EventDispatcher;
export const Evented = Ember.Evented;
export const Helper = Ember.Helper;
export const LinkComponent = Ember.LinkComponent;
export const Mixin = Ember.Mixin;
export const EmberObject = Ember.Object;
export const ObjectProxy = Ember.ObjectProxy;
export const Route = Ember.Route;
export const Router = Ember.Router;
export const Service = Ember.Service;
export const TextField = Ember.TextField;
