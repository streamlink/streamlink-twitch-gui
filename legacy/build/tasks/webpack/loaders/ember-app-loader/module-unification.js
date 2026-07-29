const TYPES = {
	adapter: {
		suffix: "Adapter"
	},
	component: {
		suffix: "Component"
	},
	controller: {
		suffix: "Controller"
	},
	fragment: {
		suffix: ""
	},
	helper: {
		suffix: "Helper"
	},
	initializer: {
		suffix: "Initializer"
	},
	"instance-initializer": {
		suffix: "Instanceinitializer"
	},
	model: {
		suffix: ""
	},
	route: {
		suffix: "Route"
	},
	serializer: {
		suffix: "Serializer"
	},
	service: {
		suffix: "Service"
	},
	template: {
		suffix: "Template"
	},
	transform: {
		suffix: "Transform"
	}
};

const COLLECTIONS = {
	components: {
		defaultType: "component",
		types: [ "component", "helper"/*, "template"*/ ],
		noNestedNames: true
	},
	initializers: {
		defaultType: "initializer",
		types: [ "initializer" ]
	},
	"instance-initializers": {
		defaultType: "instance-initializer",
		types: [ "instance-initializer" ]
	},
	models: {
		defaultType: "model",
		types: [ "model", "adapter", "serializer", "fragment" ]
	},
	routes: {
		defaultType: "route",
		types: [ "route", "controller", "template" ]
	},
	services: {
		defaultType: "service",
		types: [ "service" ]
	},
	transforms: {
		defaultType: "transform",
		types: [ "transform" ]
	}
};

const GROUPS = {
	data: [ "models", "transforms" ],
	init: [ "initializers", "instance-initializers" ],
	ui: [ "components", "routes" ]
};


module.exports = { TYPES, COLLECTIONS, GROUPS };
