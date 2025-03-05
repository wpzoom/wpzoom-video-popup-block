const webpack                  = require( 'webpack' ),
      path                     = require( 'path' ),
      glob                     = require( 'glob' ),
      RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' ),
      defaultConfig            = require( '@wordpress/scripts/config/webpack.config' );

// Get all block entry points
const getBlockEntryPoints = () => {
	const entries = {};
	
	// Find all block folders
	const blockFolders = glob.sync('./src/blocks/*/', { absolute: true });
	
	blockFolders.forEach(blockPath => {
		const blockName = path.basename(blockPath);
		
		// Add index entry
		const indexFile = path.join(blockPath, 'index.js');
		if (require('fs').existsSync(indexFile)) {
			entries[`blocks/${blockName}/index`] = indexFile;
		}
		
		// Add view script if it exists
		const viewFile = path.join(blockPath, 'view.js');
		if (require('fs').existsSync(viewFile)) {
			entries[`blocks/${blockName}/view`] = viewFile;
		}
		
		// Add script if it exists
		const scriptFile = path.join(blockPath, 'script.js');
		if (require('fs').existsSync(scriptFile)) {
			entries[`blocks/${blockName}/script`] = scriptFile;
		}
	});
	
	return entries;
};

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'blocks/video-cover/view': path.resolve(process.cwd(), 'src/blocks/video-cover/view.js'),
		'button-extension': path.resolve(process.cwd(), 'src/button-extension.js'),
		'button-extension-frontend': path.resolve(process.cwd(), 'src/button-extension-frontend.js')
	},
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
