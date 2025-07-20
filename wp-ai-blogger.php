<?php
/**
 * Plugin Name: WP AI Blogger
 * Plugin URI: https://wpaiblogger.com/
 * Author: WP Solvex
 * Author URI: https://wpsolvex.com/
 * Version: 0.0.1
 * Requires at least: 5.6
 * Requires PHP: 5.6
 * Description: WP AI Blogger is a plugin that helps you to create a blog post automatically. It's beyond blogging.
 * Text Domain: wp-ai-blogger
 *
 * @package wp-ai-blogger
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define Constants.
define( 'WP_AI_BLOGGER_FILE', __FILE__ );
define( 'WP_AI_BLOGGER_VERSION', '0.0.1' );
define( 'WP_AI_BLOGGER_DIR', plugin_dir_path( WP_AI_BLOGGER_FILE ) );
define( 'WP_AI_BLOGGER_BASE_PATH', plugin_basename( WP_AI_BLOGGER_FILE ) );
define( 'WP_AI_BLOGGER_BASE_URL', plugins_url( '/', WP_AI_BLOGGER_FILE ) );

// Define Plugin Option.
define( 'WP_AI_BLOGGER_SLUG', 'wp-ai-blogger' );
define( 'WP_AI_BLOGGER_DB_OPTION', 'wp_ai_blogger_settings' );
define( 'WP_AI_BLOGGER_CAPABILITY', 'manage_options' );

// Store Linking.
define( 'WP_AI_BLOGGER_PRODUCT_NAME', 'WP AI Blogger' );
define( 'WP_AI_BLOGGER_PUBLIC_TOKEN', 'pt_YA4aSFMwU9stG91RYGGfV7aq' );
define( 'WP_AI_BLOGGER_PRODUCT_ID', '2effb53f-1066-40d3-9667-ef9f09f91db1' );
define( 'WP_AI_BLOGGER_POST_CREATION_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-post' );

// CPT Constants.
define( 'WP_AI_BLOGGER_CPT_CAMPAIGN', 'campaign' );

// Define Upgrade Link.
define( 'WP_AI_BLOGGER_UPGRADE_LINK', 'https://wpaiblogger.com/' );

// Include required files.
require_once 'inc/functions/common.php';

// Include notice library file.
require_once 'inc/web-notices/class-web-notices.php';

// Plugin loader.
require_once 'loader.php';

