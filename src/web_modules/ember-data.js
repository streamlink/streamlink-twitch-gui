import "ember";
import "bower/ember-data/ember-data";


const EmberData = window.DS;


export default EmberData;

// attributes
export const attr = EmberData.attr;
export const belongsTo = EmberData.belongsTo;
export const hasMany = EmberData.hasMany;

// classes
export const Adapter = EmberData.Adapter;
export const AdapterError = EmberData.AdapterError;
export const BooleanTransform = EmberData.BooleanTransform;
export const EmbeddedRecordsMixin = EmberData.EmbeddedRecordsMixin;
export const InvalidError = EmberData.InvalidError;
export const Model = EmberData.Model;
export const PromiseObject = EmberData.PromiseObject;
export const RESTAdapter = EmberData.RESTAdapter;
export const RESTSerializer = EmberData.RESTSerializer;
export const Store = EmberData.Store;
