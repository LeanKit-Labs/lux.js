module.exports = {
	extends: [ "leankit/es6", "leankit/react" ],
	parser: "babel-eslint",
	plugins: [ "babel" ],
	rules: {
		"no-unused-expressions": 2,
		"prefer-arrow-callback": 0,
		"init-declarations": 0,
		"react/jsx-key": [ 2 ],

		// plugin for babel eslint to fix some problems with the core rules
		"generator-star-spacing": [ "error" ],
		"array-callback-return": "off",
		"prefer-rest-params": "off",
		"object-curly-spacing": [ "error", "always" ],
		"object-shorthand": [ "error", "always" ],
		"arrow-parens": [ "error", "as-needed" ],
		"no-await-in-loop": "error" // nothing to disable
	}
};
