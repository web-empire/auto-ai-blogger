// Load the default @wordpress/scripts config object
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

// Use the defaultConfig but replace the entry and output properties.
module.exports = {
	...defaultConfig,
	mode: 'production',
	optimization: {
		usedExports: true,
	},
	entry: {
		'blog-app': path.resolve( __dirname, 'src/dashboard/DashboardApp.js' ),
	},
	resolve: {
		alias: {
			...defaultConfig.resolve.alias,
			'@BlogApp': path.resolve( __dirname, 'src/dashboard/' ),
		},
	},
	output: {
		...defaultConfig.output,
		filename: '[name].js',
		path: path.resolve( __dirname, 'assets/build' ),
	},
	performance: {
		hints: 'warning', // Performance warnings.
	},
};
