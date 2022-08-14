const webpack                  = require( 'webpack' ),
      path                     = require( 'path' ),
      glob                     = require( 'glob' ),
      RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' ),
      defaultConfig            = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,

	entry: glob.sync( './src/**/*.{js,ts,scss}' ).reduce( ( acc, path ) => {
		const entry  = path.replace( /^\.\/src\//i, '' ).replace( /\.(js|ts|scss)/i, '' );
		acc[ entry ] = path;
		return acc;
	}, {} ),

	output: {
		filename: '[name].js',
		path:     path.resolve( process.cwd(), 'dist/' ),
	},

	optimization: {
		...defaultConfig.optimization,
		concatenateModules: true,
		minimize:           true,
	},

	devtool: 'source-map',

	resolve: {
		fallback: { 'url': require.resolve( 'url/' ) }
	},

	plugins: [
		...defaultConfig.plugins,
		new RemoveEmptyScriptsPlugin()
	],
}
