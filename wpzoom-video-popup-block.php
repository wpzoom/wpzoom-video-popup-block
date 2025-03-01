<?php
/**
 * Plugin Name: WPZOOM Inspiro Blocks
 * Plugin URI: https://wordpress.org/plugins/wpzoom-video-popup-block/
 * Description: Quickly add a button displaying a YouTube, Vimeo or Self-Hosted (MP4) video in a popup when clicked.
 * Version: 1.1.3
 * Author: WPZOOM
 * Author URI: https://www.wpzoom.com/
 * Text Domain: wpzoom-video-popup-block
 * Domain Path: /languages
 * License: GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Tested up to: 6.7
 *
 * @package Wpzoom_Video_Popup_Block
 */

namespace WPZOOM\Inspiro_Blocks;

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
	public const VERSION = '1.1.3';

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
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_swiper_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		// Add some useful CSS classes.
		add_filter( 'body_class', array( $this, 'body_class' ) );
		add_filter( 'admin_body_class', array( $this, 'admin_body_class' ) );
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

        // Register all blocks
        $blocks = [
            'video-popup',
            'slideshow',
            'slide',
            'video-cover',
            'image-slideshow'
        ];

        foreach ($blocks as $block) {
            $block_dir = $this->plugin_path . 'dist/blocks/' . $block;
            
            // Check if block.json exists
            if ( file_exists( $block_dir . '/block.json' ) ) {
                register_block_type($block_dir);
            }
        }

		// Setup translations for the main block.
		wp_set_script_translations(
			'wpzoom-video-popup-block-block-editor-script-js',
			'wpzoom-video-popup-block',
			$this->plugin_path . 'languages/'
		);

        // Localize script with plugin data
        wp_localize_script(
            'wpzoom-video-popup-block-block-editor-script-js',
            'wpzoomInspiroBlocksData',
            array(
                'pluginUrl' => plugin_dir_url(__FILE__),
            )
        );

        // Enqueue dashicons on frontend if video cover block is present
        if ( ! is_admin() && has_block('wpzoom/video-cover') ) {
            wp_enqueue_style('dashicons');
        }
	}

    /**
	 * Enqueues the Swiper assets if the block is on the page.
	 *
	 * @since  1.1.2
	 * @return void
	 */
	function enqueue_swiper_assets() {
		// Register Swiper styles and scripts.
        wp_register_style(
            'wpzoom-swiper-css',
            plugins_url( 'assets/css/swiper-bundle.min.css', __FILE__ ),
            array(),
            '11.1.14'
        );
    
        wp_register_script(
            'wpzoom-swiper-js',
            plugins_url( 'assets/js/swiper-bundle.min.js', __FILE__ ),
            array(),
            '11.1.14',
            true
        );
    
        // Conditionally enqueue them if either block is on the page
        if ( has_block( 'wpzoom/slideshow' ) || has_block( 'wpzoom/image-slideshow' ) ) {
            wp_enqueue_style( 'wpzoom-swiper-css' );
            wp_enqueue_script( 'wpzoom-swiper-js' );
        }
	}

	function enqueue_editor_assets() {
		wp_localize_script( 
            'wpzoom-slideshow-editor-script', 
            'wpzoomSlideshowData', 
            array(
                'isPro' => $this->is_pro(),
                'pluginUrl' => $this->plugin_url,
		    ) 
        );
	}

    /**
	 * Enqueues the icons font for the admin.
	 * 
	 * @since  1.1.3
	 * @return void
	 */
	public function enqueue_icons_font() {
		// Register Swiper styles and scripts.
		wp_register_style(
			'wpzoom-slideshow-block-icons-font',
			plugins_url( 'assets/fonts/wpzoom-slideshow.css', __FILE__ ),
			array(),
			'1.0.0'
		);
		
		wp_enqueue_style( 'wpzoom-slideshow-block-icons-font' );
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

	/**
	 * Returns whether the plugin is in "PRO" mode.
	 *
	 * @since  1.0.1
	 * @return bool  Boolean indicating whether the plugin is in "PRO" mode.
	 */
	public function is_pro() {
		return boolval( apply_filters( 'wpzoom_video_popup_block_is_pro', false ) );
	}

	/**
	 * Adds some classes for the plugin to the `<body>` tag of the page.
	 *
	 * @since  1.0.1
	 * @param  array $classes Array of existing classes.
	 * @return array          The modified classes array.
	 */
	public function body_class( $classes ) {
		
        if ( has_block( 'wpzoom-video-popup-block/block' ) ) {
			$classes[] = 'wpzoom-video-popup_enabled';

			if ( is_admin() ) {
				$classes[] = 'wpzoom-video-popup_admin';
			}

			if ( $this->is_pro() ) {
				$classes[] = 'wpzoom-video-popup_is-pro';
			}
		}

        if ( has_block( 'wpzoom-slideshow-block/block' ) ) {
			$classes[] = 'wpzoom-slideshow_enabled';

			if ( is_admin() ) {
				$classes[] = 'wpzoom-slideshow_admin';
			}

			if ( $this->is_pro() ) {
				$classes[] = 'wpzoom-slideshow_is-pro';
			}
		}

		return $classes;
	}

	/**
	 * Adds some classes for the plugin to the `<body>` tag of the WordPress admin.
	 *
	 * @since  1.0.1
	 * @param  string $classes Space-separated string of existing classes.
	 * @return string          The modified classes string.
	 */
	public function admin_body_class( $classes ) {
		if ( has_block( 'wpzoom-video-popup-block/block' ) ) {
			$classes .= ' wpzoom-video-popup_enabled ';

			if ( is_admin() ) {
				$classes .= ' wpzoom-video-popup_admin ';
			}

			if ( $this->is_pro() ) {
				$classes .= ' wpzoom-video-popup_is-pro ';
			}
		}

        if ( has_block( 'wpzoom-slideshow-block/block' ) ) {
			$classes .= ' wpzoom-slideshow_enabled ';

			if ( is_admin() ) {
				$classes .= ' wpzoom-slideshow_admin ';
			}

			if ( $this->is_pro() ) {
				$classes .= ' wpzoom-slideshow_is-pro ';
			}
		}

		return $classes;
	}
}
