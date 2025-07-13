<?php
/**
 * Maintenance.
 *
 * @package WP_AI_Blogger
 * @since x.x.x
 */

namespace WPAIBlogger\Core;

use WPAIBlogger\Inc\Traits\Get_Instance;

/**
 * Update Compatibility
 *
 * @package WP_AI_Blogger
 */

/**
 * Update initial setup
 *
 * @since x.x.x
 */
class Maintenance {
	use Get_Instance;

	/**
	 *  Constructor
	 */
	public function __construct() {
		if ( is_admin() ) {
			add_action( 'admin_init', self::class . '::init' );
		} else {
			add_action( 'init', self::class . '::init' );
		}
	}

	/**
	 * Init
	 *
	 * @since x.x.x
	 * @return void
	 */
	public static function init(): void {
		do_action( 'wp_ai_blogger_update_before' );

		// Get auto saved version number.
		$saved_version = get_option( 'wp_ai_blogger_saved_version', false );

		// Update auto saved version number.
		if ( ! $saved_version ) {
			update_option( 'wp_ai_blogger_saved_version', WP_AI_BLOGGER_VERSION );
		}

		// If equals then return.
		if ( version_compare( strval( $saved_version ), WP_AI_BLOGGER_VERSION, '=' ) ) {
			return;
		}

		// Update auto saved version number.
		update_option( 'wp_ai_blogger_saved_version', WP_AI_BLOGGER_VERSION );

		do_action( 'wp_ai_blogger_update_after' );
	}
}
