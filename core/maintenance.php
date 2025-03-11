<?php
/**
 * Maintenance.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace AutoBlogAI\Core;

use AutoBlogAI\Inc\Traits\Get_Instance;

/**
 * Update Compatibility
 *
 * @package AutoBlog_AI
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
		do_action( 'autoblog_ai_update_before' );

		// Get auto saved version number.
		$saved_version = get_option( 'autoblog_ai_saved_version', false );

		// Update auto saved version number.
		if ( ! $saved_version ) {
			update_option( 'autoblog_ai_saved_version', WP_AI_BLOGGER_VERSION );
		}

		// If equals then return.
		if ( version_compare( strval( $saved_version ), WP_AI_BLOGGER_VERSION, '=' ) ) {
			return;
		}

		// Update auto saved version number.
		update_option( 'autoblog_ai_saved_version', WP_AI_BLOGGER_VERSION );

		do_action( 'autoblog_ai_update_after' );
	}
}
