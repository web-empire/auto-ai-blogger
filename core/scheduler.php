<?php
/**
 * Scheduler.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace WPAIBlogger\Core;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Metadata;

/**
 * Create auto blog post scheduler
 *
 * @since x.x.x
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

		// add_filter( 'cron_schedules', [ $this, 'custom_cron_schedules' ] );

		add_action( 'wp_ai_blogger_create_blog_post', [ $this, 'create_blog_post' ] );

		// foreach ( $this->schedules as $campaign_id => $days ) {
		// if ( ! wp_next_scheduled( 'wp_ai_blogger_create_blog_post' ) ) {
		// $args = [ $campaign_id ];
		// wp_schedule_event( time(), 'per_' . $days . '_days', 'wp_ai_blogger_create_blog_post', $args );
		// }
		// }
	}

	/**
	 * Custom cron schedules.
	 *
	 * @param array $schedules Schedules.
	 * @since x.x.x
	 * @return array
	 */
	public function custom_cron_schedules( $schedules ) {
		// $this->schedules has the days so adjust them in schedules.
		foreach ( $this->schedules as $campaign_id => $days ) {
			// Check if the target is reached.
			if ( wpaib_is_campaign_posts_target_achieved( $campaign_id ) ) {
				continue;
			}

			// Add the schedule.
			$days = absint( $days );

			// Check if the schedule already exists.
			if ( isset( $schedules[ 'per_' . $days . '_days' ] ) ) {
				continue;
			}

			$schedules[ 'per_' . $days . '_days' ] = [
				'interval' => $days * 24 * 60 * 60,
				'display'  => sprintf(
					/* translators: %d: number of days */
					__( 'Every %d days', 'wp-ai-blogger' ),
					$days
				),
			];
		}

		return $schedules;
	}

	/**
	 * Create blog post.
	 *
	 * @param int $campaign_id Campaign ID.
	 *
	 * @since x.x.x
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
