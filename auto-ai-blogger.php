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
define( 'WP_AI_BLOGGER_FILE', __FILE__ );
define( 'WP_AI_BLOGGER_VERSION', '0.0.2' );
define( 'WP_AI_BLOGGER_DIR', plugin_dir_path( WP_AI_BLOGGER_FILE ) );
define( 'WP_AI_BLOGGER_BASE_PATH', plugin_basename( WP_AI_BLOGGER_FILE ) );
define( 'WP_AI_BLOGGER_BASE_URL', plugins_url( '/', WP_AI_BLOGGER_FILE ) );

// Define Plugin Option.
define( 'WP_AI_BLOGGER_SLUG', 'auto-ai-blogger' );
define( 'WP_AI_BLOGGER_DB_OPTION', 'wp_ai_blogger_settings' );
define( 'WP_AI_BLOGGER_CAPABILITY', 'manage_options' );

// Store Linking.
define( 'WP_AI_BLOGGER_PUBLIC_TOKEN', 'pt_YA4aSFMwU9stG91RYGGfV7aq' );
define( 'WP_AI_BLOGGER_POST_CREATION_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-post' );
define( 'WP_AI_BLOGGER_CAMPAIGN_POST_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-campaign-post' );
define( 'WP_AI_BLOGGER_CAMPAIGN_FROM_TITLE_POST_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-content-from-title' );
define( 'WP_AI_BLOGGER_TOKEN_USAGE_API', 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data' );

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
