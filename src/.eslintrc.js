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
		"generator-star-spacing": 0,
		"babel/generator-star-spacing": [ "error" ],
		"object-curly-spacing": 0,
		"babel/object-curly-spacing": [ "error", "always" ],
		"object-shorthand": 0,
		"babel/object-shorthand": [ "error", "always" ],
		"arrow-parens": 0,
		"babel/arrow-parens": [ "error", "as-needed" ],
		"babel/no-await-in-loop": "error" // nothing to disable
	}
};
