<?php
/**
 * Scheduler.
 *
 * @package AutoBlog_AI
 * @since 1.0.0
 */

namespace WPAIBlogger\Core;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Metadata;

/**
 * Create auto blog post scheduler
 *
 * @since 1.0.0
 */
class Scheduler {
	use Get_Instance;

	/**
	 * Schedules.
	 *
	 * @var array
	 */
	private $schedules = [];

	/**
	 *  Constructor
	 */
	public function __construct() {
		$this->schedules = wpaib_get_schedules();

		if ( empty( $this->schedules ) ) {
			return;
		}

		add_action( 'wp_ai_blogger_create_blog_post', [ $this, 'create_blog_post' ] );
	}

	/**
	 * Create blog post.
	 *
	 * @param int $campaign_id Campaign ID.
	 *
	 * @since 1.0.0
	 * @return string|void|int|WP_Error
	 */
	public function create_blog_post( $campaign_id ) {
		// Get the campaign instance.
		$campaign = get_post( $campaign_id );

		// Check if the campaign is valid.
		if ( ! $campaign ) {
			return __( 'Invalid campaign ID.', 'wp-ai-blogger' );
		}

		// Check if the campaign is valid.
		$campaign_status = Metadata::get_campaign_meta( $campaign_id, 'status' );
		if ( empty( $campaign_status ) || $campaign_status !== 'publish' ) {
			return __( 'Campaign is not active.', 'wp-ai-blogger' );
		}

		// Check if the target is reached.
		if ( wpaib_is_campaign_posts_target_achieved( $campaign_id ) ) {
			return __( 'Campaign posts target already achieved.', 'wp-ai-blogger' );
		}

		// Create the blog post.
		return wpaib_create_blog_post( $campaign_id );
	}
}
