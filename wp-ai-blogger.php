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
define( 'WP_AUTOBLOG_AI_FILE', __FILE__ );
define( 'WP_AUTOBLOG_AI_VERSION', '0.0.1' );
define( 'WP_AUTOBLOG_AI_DIR', plugin_dir_path( WP_AUTOBLOG_AI_FILE ) );
define( 'WP_AUTOBLOG_AI_BASE_PATH', plugin_basename( WP_AUTOBLOG_AI_FILE ) );
define( 'WP_AUTOBLOG_AI_BASE_URL', plugins_url( '/', WP_AUTOBLOG_AI_FILE ) );

// Define Plugin Option.
define( 'WP_AUTOBLOG_AI_SLUG', 'wp-ai-blogger' );
define( 'WP_AUTOBLOG_AI_DB_OPTION', 'autoblog_ai_settings' );
define( 'WP_AUTOBLOG_AI_CAPABILITY', 'manage_options' );

// Store Linking.
define( 'WP_AUTOBLOG_AI_PRODUCT_NAME', 'WP AI Blogger' );
define( 'WP_AUTOBLOG_AI_PUBLIC_TOKEN', 'pt_YA4aSFMwU9stG91RYGGfV7aq' );
define( 'WP_AUTOBLOG_AI_PRODUCT_ID', '2effb53f-1066-40d3-9667-ef9f09f91db1' );

// Define Upgrade Link.
define( 'WP_AUTOBLOG_AI_UPGRADE_LINK', '#' );

// Include required files.
require_once 'inc/functions/common.php';

// Include notice library file.
require_once 'inc/web-notices/class-web-notices.php';

// Plugin loader.
require_once 'loader.php';
