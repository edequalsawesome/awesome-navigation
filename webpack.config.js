const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		// Block entry points (auto-detected from block.json would normally handle this,
		// but we need to add a custom entry so we define both explicitly).
		'menu-toggle/index': path.resolve(
			process.cwd(),
			'src/menu-toggle/index.js'
		),
		// Search toggle block.
		'search-toggle/index': path.resolve(
			process.cwd(),
			'src/search-toggle/index.js'
		),
		// Pill extension — editor-only script that hooks into core/group.
		'pill-extension/index': path.resolve(
			process.cwd(),
			'src/pill-extension/index.js'
		),
	},
};
