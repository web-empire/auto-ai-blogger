<?php
/**
 * Plugin Name: AutoBlog AI
 * Plugin URI: #
 * Author: AutoBlog AI
 * Author URI: #
 * Version: 0.0.1
 * Requires at least: 5.6
 * Requires PHP: 5.6
 * Description: AutoBlog AI is a plugin that helps you to create a blog post automatically. It's beyond blogging.
 * Text Domain: autoblog-ai
 *
 * @package autoblog-ai
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
define( 'WP_AUTOBLOG_AI_DB_OPTION', 'autoblog_ai_settings' );
define( 'WP_AUTOBLOG_AI_CAPABILITY', 'manage_options' );

// Define Upgrade Link.
define( 'WP_AUTOBLOG_AI_UPGRADE_LINK', '#' );

// Include required files.
require_once 'inc/functions/common.php';

// Plugin loader.
require_once 'loader.php';
