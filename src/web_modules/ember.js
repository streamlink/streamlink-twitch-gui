import "jquery";
import "ember-source/dist/ember.debug";


const Ember = window.Ember;


export default Ember;

// property
export const get = Ember.get;
export const set = Ember.set;
export const getWithDefault = Ember.getWithDefault;
export const getProperties = Ember.getProperties;
export const setProperties = Ember.setProperties;
export const defineProperty = Ember.defineProperty;
export const addObserver = Ember.addObserver;
export const removeObserver = Ember.removeObserver;

// functions
export const getOwner = Ember.getOwner;
export const setOwner = Ember.setOwner;
export const isNone = Ember.isNone;
export const makeArray = Ember.makeArray;
export const assign = Ember.assign;
export const sendEvent = Ember.sendEvent;

// libs
export const $ = Ember.$;
export const HTMLBars = Ember.HTMLBars;
export const RSVP = Ember.RSVP;

// collections
export const computed = Ember.computed;
export const inject = Ember.inject;
export const run = Ember.run;

// classes
export const EmberNativeArray = Ember.A;
export const Application = Ember.Application;
export const ArrayProxy = Ember.ArrayProxy;
export const Binding = Ember.Binding;
export const Component = Ember.Component;
export const ComputedProperty = Ember.ComputedProperty;
export const Controller = Ember.Controller;
export const DefaultResolver = Ember.DefaultResolver;
export const EventDispatcher = Ember.EventDispatcher;
export const Evented = Ember.Evented;
export const Helper = Ember.Helper;
export const LinkComponent = Ember.LinkComponent;
export const Mixin = Ember.Mixin;
export const EmberObject = Ember.Object;
export const ObjectProxy = Ember.ObjectProxy;
export const observer = Ember.observer;
export const on = Ember.on;
export const Route = Ember.Route;
export const Router = Ember.Router;
export const Service = Ember.Service;
export const TextField = Ember.TextField;
