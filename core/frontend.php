<?php
/**
 * Frontend.
 *
 * @package wp-ai-blogger
 * @since x.x.x
 */

namespace WPAIBlogger\Core;

use WPAIBlogger\Inc\Traits\Get_Instance;

defined( 'ABSPATH' ) || exit;

/**
 * This class handles admin filters for posts
 *
 * @class Frontend
 */
class Frontend {
	use Get_Instance;

	/**
	 * Constructor
	 *
	 * @since x.x.x
	 */
	public function __construct() {
		// Hook into the_content to track views when posts are displayed.
		add_action( 'wp_head', [ $this, 'track_post_views' ] );
	}

	/**
	 * Track post views.
	 *
	 * @return void
	 * @since x.x.x
	 */
	public function track_post_views(): void {
		if ( is_singular() ) {
			global $post;
			if ( $post ) {
				wpaib_track_post_view( $post->ID );
			}
		}
	}
}
