<?php
/**
 * Plugin Name: Auto AI Blogger
 * Plugin URI: https://wpaiblogger.com/
 * Author: WP Solvex
 * Author URI: https://wpsolvex.com/
 * Version: 0.0.2
 * License: GPLv2 or later
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Description: Auto AI Blogger is a plugin that helps you to create a blog post automatically. It's beyond blogging.
 * Text Domain: auto-ai-blogger
 *
 * @package auto-ai-blogger
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define Constants.
define( 'AUTOAIB_FILE', __FILE__ );
define( 'AUTOAIB_VERSION', '0.0.2' );
define( 'AUTOAIB_DIR', plugin_dir_path( AUTOAIB_FILE ) );
define( 'AUTOAIB_BASE_PATH', plugin_basename( AUTOAIB_FILE ) );
define( 'AUTOAIB_BASE_URL', plugins_url( '/', AUTOAIB_FILE ) );

// Define Plugin Option.
define( 'AUTOAIB_SLUG', 'auto-ai-blogger' );
define( 'AUTOAIB_DB_OPTION', 'autoaib_settings' );
define( 'AUTOAIB_CAPABILITY', 'manage_options' );

// Store Linking.
define( 'AUTOAIB_PUBLIC_TOKEN', 'pt_YA4aSFMwU9stG91RYGGfV7aq' );
define( 'AUTOAIB_POST_CREATION_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-post' );
define( 'AUTOAIB_CAMPAIGN_POST_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-campaign-post' );
define( 'AUTOAIB_CAMPAIGN_FROM_TITLE_POST_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-content-from-title' );
define( 'AUTOAIB_TOKEN_USAGE_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data' );

// CPT Constants.
define( 'AUTOAIB_CPT_CAMPAIGN', 'campaign' );

// Define Upgrade Link.
define( 'AUTOAIB_UPGRADE_LINK', 'https://wpaiblogger.com/' );

// Include required files.
require_once 'inc/functions/common.php';

// Include notice library file.
require_once 'inc/web-notices/class-web-notices.php';

// Plugin loader.
require_once 'loader.php';
