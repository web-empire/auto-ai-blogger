<?php
/**
 * Scheduler.
 *
 * @package wp-ai-blogger
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

		add_action( 'wp_ai_blogger_create_blog_post', [ $this, 'create_blog_post' ], 10, 1 );

		// Initialize WP Cron schedules for campaigns.
		add_filter( 'cron_schedules', [ $this, 'custom_cron_schedules' ] );
		$this->setup_campaign_schedules();
	}

	/**
	 * Custom cron schedules.
	 *
	 * @param array $schedules Schedules.
	 * @since x.x.x
	 * @return array
	 */
	public function custom_cron_schedules( $schedules ) {
		foreach ( $this->schedules as $campaign_id => $schedule_data ) {
			// Check if the target is reached.
			if ( wpaib_is_campaign_posts_target_achieved( $campaign_id ) ) {
				continue;
			}

			$schedule_name    = $this->get_schedule_name( $schedule_data );
			$interval_seconds = $this->get_schedule_interval_seconds( $schedule_data );

			// Check if the schedule already exists.
			if ( isset( $schedules[ $schedule_name ] ) ) {
				continue;
			}

			$interval   = absint( $schedule_data['interval'] ?? 1 );
			$unit       = sanitize_text_field( $schedule_data['unit'] ?? 'day' );
			$unit_label = $interval > 1 ? $unit . 's' : $unit;

			$schedules[ $schedule_name ] = [
				'interval' => $interval_seconds,
				'display'  => sprintf(
					/* translators: %1$d: interval number, %2$s: time unit */
					__( 'Every %1$d %2$s', 'wp-ai-blogger' ),
					$interval,
					$unit_label
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
		// Validate campaign ID.
		$campaign_id = absint( $campaign_id );
		if ( ! $campaign_id ) {
			return new \WP_Error( 'invalid_campaign_id', __( 'Invalid campaign ID.', 'wp-ai-blogger' ) );
		}

		// Get the campaign instance.
		$campaign = get_post( $campaign_id );

		// Check if the campaign is valid.
		if ( ! $campaign || $campaign->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
			return new \WP_Error( 'campaign_not_found', __( 'Campaign not found.', 'wp-ai-blogger' ) );
		}

		// Check if the campaign is active.
		$campaign_status = Metadata::get_campaign_meta( $campaign_id, 'status' );
		if ( empty( $campaign_status ) || $campaign_status !== 'publish' ) {
			return new \WP_Error( 'campaign_inactive', __( 'Campaign is not active.', 'wp-ai-blogger' ) );
		}

		// Check if the target is reached.
		if ( wpaib_is_campaign_posts_target_achieved( $campaign_id ) ) {
			// Clean up schedule since target is reached.
			wpaib_clear_campaign_schedule( $campaign_id );
			return new \WP_Error( 'target_achieved', __( 'Campaign posts target already achieved.', 'wp-ai-blogger' ) );
		}

		// Create the blog post.
		return wpaib_create_blog_post( $campaign_id );
	}

	/**
	 * Setup individual campaign schedules.
	 *
	 * @since x.x.x
	 * @return void
	 */
	private function setup_campaign_schedules(): void {
		foreach ( $this->schedules as $campaign_id => $schedule_data ) {
			try {
				// Validate campaign ID.
				$campaign_id = absint( $campaign_id );
				if ( ! $campaign_id ) {
					continue;
				}

				// Check campaign post existence & status should be publish.
				$campaign_post = get_post( $campaign_id );
				if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
					continue;
				}
				if ( $campaign_post->post_status !== 'publish' ) {
					continue;
				}

				// Check if the target is reached.
				if ( wpaib_is_campaign_posts_target_achieved( $campaign_id ) ) {
					wpaib_clear_campaign_schedule( $campaign_id );
					continue;
				}

				// Validate schedule data.
				if ( ! is_array( $schedule_data ) || empty( $schedule_data['interval'] ) || empty( $schedule_data['unit'] ) ) {
					continue;
				}

				$schedule_name = $this->get_schedule_name( $schedule_data );

				// Check if event is already scheduled.
				$hook_name = 'wp_ai_blogger_create_blog_post';
				$args      = [ $campaign_id ];

				if ( ! wp_next_scheduled( $hook_name, $args ) ) {
					// Schedule the event.
					wp_schedule_event( time(), $schedule_name, $hook_name, $args );
				}
			} catch ( \Exception $e ) {
				continue;
			}
		}
	}

	/**
	 * Get schedule interval in seconds.
	 *
	 * @param array $schedule_data Schedule data with interval and unit.
	 * @return int Interval in seconds.
	 * @since x.x.x
	 */
	private function get_schedule_interval_seconds( $schedule_data ): int {
		$interval = absint( $schedule_data['interval'] ?? 1 );
		$unit     = sanitize_text_field( $schedule_data['unit'] ?? 'day' );

		$multipliers = [
			'day'   => DAY_IN_SECONDS,
			'week'  => WEEK_IN_SECONDS,
			'month' => MONTH_IN_SECONDS,
			'year'  => YEAR_IN_SECONDS,
		];

		// Fallback for missing constants.
		if ( ! defined( 'MONTH_IN_SECONDS' ) ) {
			$multipliers['month'] = 30 * DAY_IN_SECONDS;
		}
		if ( ! defined( 'YEAR_IN_SECONDS' ) ) {
			$multipliers['year'] = 365 * DAY_IN_SECONDS;
		}

		return $interval * ( $multipliers[ $unit ] ?? DAY_IN_SECONDS );
	}

	/**
	 * Get schedule name for WP Cron.
	 *
	 * @param array $schedule_data Schedule data with interval and unit.
	 * @return string Schedule name.
	 * @since x.x.x
	 */
	private function get_schedule_name( $schedule_data ): string {
		$interval = absint( $schedule_data['interval'] ?? 1 );
		$unit     = sanitize_text_field( $schedule_data['unit'] ?? 'day' );

		return "wpaib_every_{$interval}_{$unit}" . ( $interval > 1 ? 's' : '' );
	}
}
