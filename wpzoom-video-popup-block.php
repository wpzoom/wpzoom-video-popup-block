<?php
/**
 * Plugin Name: WPZOOM Video Popup Block
 * Plugin URI: https://www.wpzoom.com/plugins/video-popup-block/
 * Description: Show a YouTube/Vimeo video in a popup when clicked.
 * Version: 1.0.0
 * Author: WPZOOM
 * Author URI: https://www.wpzoom.com/
 * Text Domain: wpzoom-video-popup-block
 * Domain Path: /languages
 * License: GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 6.0
 * Requires PHP:      7.2
 * Tested up to: 6.0.1
 *
 * @package Wpzoom_Video_Popup_Block
 */

namespace WPZOOM\Video_Popup_Block;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Intitalize the plugin.
new Plugin();

/**
 * Main WPZOOM Video Popup Block class.
 *
 * The entry point into WordPress for this plugin.
 *
 * @since 1.0.0
 */
class Plugin {
	/**
	 * The version of this plugin.
	 *
	 * @since 1.0.0
	 * @var   int
	 */
	public const VERSION = '1.0.0';

	/**
	 * Path to the plugin directory.
	 *
	 * @since 1.0.0
	 * @var   string
	 */
	public $plugin_path;

	/**
	 * URL to the plugin directory.
	 *
	 * @since 1.0.0
	 * @var   string
	 */
	public $plugin_url;

	/**
	 * Main directory name of the plugin.
	 *
	 * @since 1.0.0
	 * @var   string
	 */
	public $plugin_dirname;

	/**
	 * Main file name of the plugin.
	 *
	 * @since 1.0.0
	 * @var   string
	 */
	public $plugin_filename;

	/**
	 * The name of the block this plugin adds.
	 *
	 * @since 1.0.0
	 * @var   string
	 */
	public $block_name;

	/**
	 * Plugin class constructor.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public function __construct() {
		$this->plugin_path     = plugin_dir_path( __FILE__ );
		$this->plugin_url      = plugin_dir_url( __FILE__ );
		$this->plugin_dirname  = trailingslashit( wp_basename( __DIR__ ) );
		$this->plugin_filename = wp_basename( __FILE__ );
		$this->block_name      = 'wpzoom-video-popup-block/block';

		// Do some initial setup on the WordPress `init` hook.
		add_action( 'init', array( $this, 'init' ) );

		// Add the WPZOOM block category, if needed.
		add_filter( 'block_categories_all', array( $this, 'block_categories' ), 10, 2 );
	}

	/**
	 * Initializes the plugin and hooks into WordPress.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public function init() {
		// Load the translations for the plugin.
		load_plugin_textdomain(
			'wpzoom-video-popup-block',
			false,
			$this->plugin_dirname . 'languages/'
		);

		// Register the main block in Gutenberg.
		register_block_type( $this->plugin_path . 'block.json' );

		// Setup translations for the main block.
		wp_set_script_translations(
			'wpzoom-video-popup-block-block-editor-script-js',
			'wpzoom-video-popup-block',
			$this->plugin_path . 'languages/'
		);
	}

	/**
	 * Adds the WPZOOM block category if needed.
	 *
	 * @since  1.0.0
	 * @param  array $categories The list of existing block categories.
	 * @return array             The modified list of block categories.
	 */
	public function block_categories( $categories ) {
		if ( empty( $categories ) || ( ! empty( $categories ) && is_array( $categories ) && ! in_array( 'wpzoom-blocks', wp_list_pluck( $categories, 'slug' ), true ) ) ) {
			$categories = array_merge(
				$categories,
				array(
					array(
						'slug'  => 'wpzoom-blocks',
						'title' => esc_html__( 'WPZOOM - Blocks', 'wpzoom-video-popup-block' ),
					),
				)
			);
		}

		return $categories;
	}
}
