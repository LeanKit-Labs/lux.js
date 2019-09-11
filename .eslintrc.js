module.exports = {
	extends: [ "leankit", "leankit/es6" ],
	globals: {
		lux: true,
		postal: true
	},
	parserOptions: {
		sourceType: "module"
	},
	rules: {
		"no-invalid-this": "off",
		"prefer-rest-params": "off"
	}
};
