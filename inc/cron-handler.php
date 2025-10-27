<?php
/**
 * Cron Handler class for WP AI Blogger.
 *
 * This class handles cron-related functionality including
 * post creation hooks and scheduling operations.
 * It's loaded on all requests to ensure cron hooks work properly.
 *
 * @package wp-ai-blogger
 * @subpackage Inc\Cron
 * @since 1.0.0
 */

namespace WPAIBlogger\Inc;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Metadata;

defined( 'ABSPATH' ) || exit;

/**
 * Cron Handler class for WP AI Blogger.
 *
 * @package wp-ai-blogger
 * @subpackage Inc\Cron
 * @since 1.0.0
 */
class Cron_Handler {
	use Get_Instance;

	/**
	 * Initialize cron hooks.
	 */
	protected function __construct() {
		$this->init_hooks();
	}

	/**
	 * Create a single post from campaign (cron callback).
	 *
	 * @param int $campaign_id The ID of the campaign.
	 * @since x.x.x
	 */
	public function create_single_post_from_campaign( $campaign_id ): void {
		try {
			$campaign_id = absint( $campaign_id );
			if ( $campaign_id <= 0 ) {
				return;
			}

			$campaign = get_post( $campaign_id );
			if ( ! $campaign || $campaign->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				return;
			}

			$wp_status = $campaign->post_status;
			$is_active = ( $wp_status === 'publish' );

			if ( ! $is_active ) {
				return;
			}

			// Check if campaign is paused.
			$is_paused = Metadata::get_campaign_meta( $campaign_id, 'isPaused' );
			if ( $is_paused ) {
				return;
			}

			// Get current campaign statistics.
			$posts_created   = intval( Metadata::get_campaign_meta( $campaign_id, 'postsCreated' ) );
			$posts_scheduled = intval( Metadata::get_campaign_meta( $campaign_id, 'postsScheduled' ) );
			$posts_failed    = intval( Metadata::get_campaign_meta( $campaign_id, 'postsFailed' ) );
			$max_failures    = intval( Metadata::get_campaign_meta( $campaign_id, 'maxFailures' ) ) ?: 20;

			// Calculate which post number we're trying to create.
			$target_post_number = $posts_created + 1;

			// Get or initialize retry tracking for current post.
			$retry_tracking = Metadata::get_campaign_meta( $campaign_id, 'retryTracking' ) ?: [];
			$post_key = 'post_' . $target_post_number;
			$current_attempt = isset( $retry_tracking[ $post_key ] ) ? intval( $retry_tracking[ $post_key ] ) + 1 : 1;

			// Update scheduled count and retry tracking.
			Metadata::update_campaign_meta( $campaign_id, 'postsScheduled', $posts_scheduled + 1 );
			Metadata::update_campaign_meta( $campaign_id, 'lastRun', current_time( 'mysql' ) );

			$retry_tracking[ $post_key ] = $current_attempt;
			Metadata::update_campaign_meta( $campaign_id, 'retryTracking', $retry_tracking );

			$result = $this->generate_post_from_campaign( $campaign_id, $target_post_number, $current_attempt );

			if ( $result['success'] ) {
				// Clear retry tracking for this post on success.
				unset( $retry_tracking[ $post_key ] );
				Metadata::update_campaign_meta( $campaign_id, 'retryTracking', $retry_tracking );

				// Log success with post and attempt information.
				wpaib_log_campaign_success(
					$campaign_id,
					$result['post_id'],
					[
						'post_title'     => $result['post_title'],
						'post_number'    => $target_post_number,
						'attempt_number' => $current_attempt,
						'message'        => sprintf(
							'Post #%d created successfully on attempt #%d',
							$target_post_number,
							$current_attempt
						),
					]
				);

				// Schedule next post with normal frequency after success.
				$this->schedule_next_post( $campaign_id, false );
			} else {
				// Log detailed error information with post and attempt numbers.
				$error_type = $result['error_type'] ?? $this->determine_error_type( $result['message'] ?? '' );

				$context = [
					'post_number'     => $target_post_number,
					'attempt_number'  => $current_attempt,
					'max_retries'     => $max_failures,
					'error_type'      => $error_type,
					'posts_created'   => $posts_created,
					'posts_scheduled' => $posts_scheduled + 1,
					'posts_failed'    => $posts_failed,
				];

				$error_message = sprintf(
					'Post #%d creation failed on attempt #%d/%d: %s',
					$target_post_number,
					$current_attempt,
					$max_failures,
					$result['message'] ?? 'Unknown error'
				);

				wpaib_log_campaign_error(
					$campaign_id,
					$error_type,
					$error_message,
					$context
				);

				// Check if we've exhausted all retries for this post.
				if ( $current_attempt >= $max_failures ) {
					// All retries exhausted - mark this post as failed.
					$new_posts_failed = $posts_failed + 1;
					Metadata::update_campaign_meta( $campaign_id, 'postsFailed', $new_posts_failed );

					// Clear retry tracking for this post.
					unset( $retry_tracking[ $post_key ] );
					Metadata::update_campaign_meta( $campaign_id, 'retryTracking', $retry_tracking );

					// Log that we're giving up on this post.
					wpaib_log_campaign_error(
						$campaign_id,
						'post_abandoned',
						sprintf(
							'Post #%d abandoned after %d failed attempts. Moving to next post.',
							$target_post_number,
							$max_failures
						),
						[
							'post_number'    => $target_post_number,
							'total_attempts' => $max_failures,
							'posts_failed'   => $new_posts_failed,
						]
					);

					// Schedule next post (moving on to the next post number).
					$this->schedule_next_post( $campaign_id, false );
				} else {
					// Still have retries left - schedule retry with short interval.
					$this->schedule_next_post( $campaign_id, true );
				}
			}
		} catch ( \Exception $e ) {
			return;
		}
	}

	/**
	 * Generate a post from campaign data.
	 *
	 * @param int $campaign_id The ID of the campaign.
	 * @param int $target_post_number The post number being attempted.
	 * @param int $current_attempt The attempt number for this post.
	 * @return array An array containing the success status and message.
	 * @since x.x.x
	 */
	public function generate_post_from_campaign( $campaign_id, $target_post_number = 0, $current_attempt = 0 ): array {
		try {
			$keywords           = Metadata::get_campaign_meta( $campaign_id, 'keywords' );
			$max_words          = Metadata::get_campaign_meta( $campaign_id, 'maxWords' ) ?? 1000;
			$max_title_words    = Metadata::get_campaign_meta( $campaign_id, 'maxTitleWords' ) ?? 10;
			$post_type          = Metadata::get_campaign_meta( $campaign_id, 'postType' );
			$post_status        = Metadata::get_campaign_meta( $campaign_id, 'postStatus' );
			$author_id          = Metadata::get_campaign_meta( $campaign_id, 'author' );
			$category           = Metadata::get_campaign_meta( $campaign_id, 'category' );
			$tag                = Metadata::get_campaign_meta( $campaign_id, 'tag' );
			$summary_as_excerpt = Metadata::get_campaign_meta( $campaign_id, 'summaryAsExcerpt' );

			if ( empty( $keywords ) ) {
				return [
					'success'    => false,
					'message'    => __( 'No keywords found for campaign', 'wp-ai-blogger' ),
					'error_type' => 'validation_error',
				];
			}

			$api_response = $this->call_post_creation_api( $campaign_id, $keywords, $max_words, $max_title_words );

			if ( ! $api_response['success'] ) {
				return [
					'success'    => false,
					'message'    => 'API call failed: ' . $api_response['message'],
					'error_type' => 'api_error',
				];
			}

			$api_data = $api_response['data'];

			$post_data = [
				'post_title'   => sanitize_text_field( $api_data['post_title'] ?? 'Generated Post' ),
				'post_content' => wp_kses_post( $api_data['post_content'] ?? '' ),
				'post_status'  => $post_status ? $post_status : 'draft',
				'post_type'    => $post_type ? $post_type : 'post',
				'post_author'  => $author_id ? $author_id : get_current_user_id(),
			];

			if ( $summary_as_excerpt && ! empty( $api_data['summary'] ) ) {
				$post_data['post_excerpt'] = sanitize_text_field( $api_data['summary'] );
			}

			$post_id = wp_insert_post( $post_data );

			if ( is_wp_error( $post_id ) || ! $post_id ) {
				$wp_error_message = is_wp_error( $post_id ) ? $post_id->get_error_message() : 'Unknown database error';
				return [
					'success'    => false,
					'message'    => 'Failed to create WordPress post: ' . $wp_error_message,
					'error_type' => 'database_error',
				];
			}

			if ( ! empty( $category ) ) {
				wp_set_post_categories( $post_id, [ $category ] );
			}
			if ( ! empty( $tag ) ) {
				wp_set_post_tags( $post_id, $tag );
			}

			// Add campaign reference meta to the post.
			add_post_meta( $post_id, 'wp_aib_reference', 1 );
			add_post_meta( $post_id, 'wp_aib_campaign_id', $campaign_id );

			$posts_created     = Metadata::get_campaign_meta( $campaign_id, 'postsCreated' );
			$new_posts_created = intval( $posts_created ) + 1;
			Metadata::update_campaign_meta( $campaign_id, 'postsCreated', $new_posts_created );
			Metadata::update_campaign_meta( $campaign_id, 'lastPostID', $post_id );

			// Success logging is handled in the main method to avoid duplicates.

			// Check if campaign has reached its target and mark as completed.
			$posts_target = Metadata::get_campaign_meta( $campaign_id, 'postsTarget' );
			if ( $posts_target > 0 && $new_posts_created >= intval( $posts_target ) ) {
				$this->mark_campaign_completed( $campaign_id, 'target_reached' );
			}

			return [
				'success'        => true,
				'message'        => sprintf(
					/* translators: 1: Post number, 2: Post ID. */
					__( 'Post #%1$d created successfully with ID: %2$s', 'wp-ai-blogger' ),
					$target_post_number,
					$post_id
				),
				'post_id'        => $post_id,
				'post_title'     => $post_data['post_title'] ?? '',
				'post_number'    => $target_post_number,
				'attempt_number' => $current_attempt,
			];

		} catch ( \Exception $e ) {
			return [
				'success'    => false,
				'message'    => 'Exception: ' . $e->getMessage(),
				'error_type' => 'unknown_error',
			];
		}
	}

	/**
	 * Register cron actions.
	 */
	private function init_hooks(): void {
		add_action( 'wpaib_create_single_post', [ $this, 'create_single_post_from_campaign' ] );
	}

	/**
	 * Call the post creation API with retry logic.
	 *
	 * @param int    $campaign_id The ID of the campaign.
	 * @param string $keywords The keywords for the post.
	 * @param int    $max_words The maximum number of words for the post.
	 * @param int    $max_title_words The maximum number of words for the title.
	 * @return array An array containing the API response data.
	 * @since x.x.x
	 */
	private function call_post_creation_api( $campaign_id, $keywords, $max_words, $max_title_words ): array {
		try {
			$max_words       = $max_words ? $max_words : 1000;
			$max_title_words = $max_title_words ? $max_title_words : 10;

			$site_persona_details = wpaib_get_site_persona_details( $campaign_id );

			$max_retries = 2;
			$retry_delay = 3;
			$response    = null;

			for ( $attempt = 1; $attempt <= $max_retries; $attempt++ ) {
				$response = wpaib_get_post_creation_api_response( $keywords, $max_title_words, $max_words, $site_persona_details );

				if ( ! is_wp_error( $response ) ) {
					break;
				}

				$error_code    = $response->get_error_code();
				$error_message = $response->get_error_message();

				if ( in_array( $error_code, [ 'api_error' ], true ) &&
					(
						strpos( $error_message, '502' ) !== false ||
						strpos( $error_message, '503' ) !== false ||
						strpos( $error_message, '504' ) !== false )
					) {

					if ( $attempt < $max_retries ) {
						sleep( $retry_delay );
						$retry_delay *= 2;
					}
				} else {
					break;
				}
			}

			if ( is_wp_error( $response ) ) {
				$error_code    = $response->get_error_code();
				$error_message = $response->get_error_message();

				// Enhance error message with more context.
				$detailed_message = sprintf(
					/* translators: 1: error code, 2: error message */
					__( 'API Error (%1$s): %2$s', 'wp-ai-blogger' ),
					$error_code,
					$error_message
				);

				// Add retry attempt information.
				if ( $attempt > 1 ) {
					$detailed_message .= sprintf(
						/* translators: %d: Attempt number. */
						__( ' (Failed after %d attempts)', 'wp-ai-blogger' ),
						$attempt
					);
				}

				return [
					'success'    => false,
					'message'    => $detailed_message,
					'error_code' => $error_code,
					'attempts'   => $attempt,
				];
			}

			return [
				'success' => true,
				'data'    => $response,
			];

		} catch ( \Exception $e ) {
			return [
				'success' => false,
				'message' => 'API Exception: ' . $e->getMessage(),
			];
		}
	}

	/**
	 * Schedule the next post for this campaign.
	 *
	 * @param int  $campaign_id Campaign ID.
	 * @param bool $is_retry Whether this is a retry after failure.
	 * @return void
	 * @since x.x.x
	 */
	private function schedule_next_post( $campaign_id, $is_retry = false ): void {
		try {
			// Check if campaign is already completed.
			$campaign_completed = Metadata::get_campaign_meta( $campaign_id, 'campaignCompleted' );
			if ( $campaign_completed ) {
				return;
			}

			$repeat_interval = Metadata::get_campaign_meta( $campaign_id, 'repeatInterval' );
			$repeat_unit     = Metadata::get_campaign_meta( $campaign_id, 'repeatUnit' );
			$posts_target    = Metadata::get_campaign_meta( $campaign_id, 'postsTarget' );
			$posts_created   = Metadata::get_campaign_meta( $campaign_id, 'postsCreated' );
			$posts_failed    = Metadata::get_campaign_meta( $campaign_id, 'postsFailed' );
			$max_failures    = Metadata::get_campaign_meta( $campaign_id, 'maxFailures' );

			// Check if target reached by created count only (not scheduled attempts).
			if ( $posts_target > 0 && $posts_created >= $posts_target ) {
				$this->mark_campaign_completed( $campaign_id, 'target_reached' );
				return;
			}

			// Check if failure threshold exceeded.
			if ( $max_failures > 0 && $posts_failed >= $max_failures ) {
				$this->mark_campaign_completed( $campaign_id, 'max_failures_exceeded' );
				return;
			}

			// Determine scheduling interval.
			if ( $is_retry ) {
				// For retries after failures, use a short interval (2 minutes).
				$interval_seconds = apply_filters( 'wpaib_retry_interval_seconds', 120 ); // 2 minutes default.
				$next_run = time() + $interval_seconds;
			} else {
				// Check if this is a weekly campaign with specific days selected.
				if ( 'week' === $repeat_unit ) {
					$repeat_weekly_on = Metadata::get_campaign_meta( $campaign_id, 'repeatWeeklyOn' );
					
					// If specific weekdays are selected, use weekday scheduling.
					if ( ! empty( $repeat_weekly_on ) && is_array( $repeat_weekly_on ) ) {
						$next_run = $this->calculate_next_weekday( $repeat_weekly_on, $campaign_id );
					} else {
						// No specific days selected, use normal weekly interval.
						$interval_seconds = $this->get_interval_seconds( $repeat_interval, $repeat_unit );
						$next_run = time() + $interval_seconds;
					}
				} else {
					// For non-weekly campaigns, use normal interval.
					$interval_seconds = $this->get_interval_seconds( $repeat_interval, $repeat_unit );
					$next_run = time() + $interval_seconds;
				}
			}

			wp_schedule_single_event( $next_run, 'wpaib_create_single_post', [ $campaign_id ] );

		} catch ( \Exception $e ) {
			return;
		}
	}

	/**
	 * Convert repeat interval and unit to seconds.
	 *
	 * @param int    $interval Repeat interval.
	 * @param string $unit Repeat unit.
	 * @return int Interval in seconds.
	 * @since x.x.x
	 */
	private function get_interval_seconds( $interval, $unit ): int {
		$interval = max( 1, intval( $interval ) );

		// Production mode: Normal intervals.
		switch ( $unit ) {
			case 'hour':
				$seconds = $interval * HOUR_IN_SECONDS;
				break;
			case 'day':
				$seconds = $interval * DAY_IN_SECONDS;
				break;
			case 'week':
				$seconds = $interval * WEEK_IN_SECONDS;
				break;
			case 'month':
				$seconds = $interval * MONTH_IN_SECONDS;
				break;
			default:
				$seconds = $interval * DAY_IN_SECONDS;
		}

		// Allow testing plugins to modify intervals.
		return apply_filters( 'wpaib_cron_interval_seconds', $seconds, $interval, $unit );
	}

	/**
	 * Calculate the next occurrence of selected weekdays.
	 *
	 * @param array $selected_days Array of selected weekday abbreviations (e.g., ['mon', 'wed', 'fri']).
	 * @param int   $campaign_id Campaign ID for filter context.
	 * @return int Timestamp of next occurrence.
	 * @since x.x.x
	 */
	private function calculate_next_weekday( $selected_days, $campaign_id ): int {
		if ( empty( $selected_days ) || ! is_array( $selected_days ) ) {
			// Fallback to 1 week if no days selected.
			return time() + WEEK_IN_SECONDS;
		}

		// Map weekday abbreviations to PHP day numbers (1 = Monday, 7 = Sunday).
		$day_map = [
			'mon' => 1,
			'tue' => 2,
			'wed' => 3,
			'thu' => 4,
			'fri' => 5,
			'sat' => 6,
			'sun' => 7,
		];

		// Get current day number (1-7).
		$current_day = (int) date( 'N' );
		$current_time = time();

		// Convert selected days to numeric format and sort.
		$selected_day_numbers = [];
		foreach ( $selected_days as $day ) {
			$day = strtolower( trim( $day ) );
			if ( isset( $day_map[ $day ] ) ) {
				$selected_day_numbers[] = $day_map[ $day ];
			}
		}

		if ( empty( $selected_day_numbers ) ) {
			// Fallback if no valid days.
			return time() + WEEK_IN_SECONDS;
		}

		sort( $selected_day_numbers );

		// Find the next occurrence.
		$next_day = null;
		$days_to_add = 0;

		// Check for next occurrence in current week.
		foreach ( $selected_day_numbers as $day_number ) {
			if ( $day_number > $current_day ) {
				$next_day = $day_number;
				$days_to_add = $next_day - $current_day;
				break;
			}
		}

		// If no day found in current week, use the first day of next week.
		if ( $next_day === null ) {
			$next_day = $selected_day_numbers[0];
			$days_to_add = ( 7 - $current_day ) + $next_day;
		}

		// Calculate next timestamp.
		$next_timestamp = $current_time + ( $days_to_add * DAY_IN_SECONDS );

		// Allow testing plugins to modify the weekday interval.
		// Pass the days_to_add for context (testing plugins can use this).
		$next_timestamp = apply_filters( 
			'wpaib_weekday_next_occurrence', 
			$next_timestamp, 
			$selected_days, 
			$days_to_add, 
			$campaign_id 
		);

		return $next_timestamp;
	}

	/**
	 * Determine error type based on error message for better categorization.
	 *
	 * @param string $error_message The error message.
	 * @return string The error type.
	 * @since x.x.x
	 */
	private function determine_error_type( $error_message ): string {
		$error_message = strtolower( $error_message );

		// Network/connectivity errors.
		if ( strpos( $error_message, 'timeout' ) !== false ||
			strpos( $error_message, 'network' ) !== false ||
			strpos( $error_message, 'connection' ) !== false ||
			strpos( $error_message, 'failed to connect' ) !== false ) {
			return 'network_error';
		}

		// API quota/subscription errors.
		if ( strpos( $error_message, 'quota' ) !== false ||
			strpos( $error_message, 'subscription' ) !== false ||
			strpos( $error_message, 'limit' ) !== false ||
			strpos( $error_message, 'exceeded' ) !== false ) {
			return 'quota_error';
		}

		// Content filtering errors.
		if ( strpos( $error_message, 'content filtering' ) !== false ||
			strpos( $error_message, 'blocked' ) !== false ||
			strpos( $error_message, 'safety' ) !== false ) {
			return 'content_filter_error';
		}

		// Validation errors.
		if ( strpos( $error_message, 'invalid' ) !== false ||
			strpos( $error_message, 'keywords' ) !== false ||
			strpos( $error_message, 'validation' ) !== false ) {
			return 'validation_error';
		}

		// License/authentication errors.
		if ( strpos( $error_message, 'license' ) !== false ||
			strpos( $error_message, 'token' ) !== false ||
			strpos( $error_message, 'authentication' ) !== false ||
			strpos( $error_message, 'unauthorized' ) !== false ) {
			return 'auth_error';
		}

		// API response errors.
		if ( strpos( $error_message, 'api' ) !== false ||
			strpos( $error_message, 'status code' ) !== false ||
			strpos( $error_message, 'response' ) !== false ) {
			return 'api_error';
		}

		// Database errors.
		if ( strpos( $error_message, 'database' ) !== false ||
			strpos( $error_message, 'insert' ) !== false ||
			strpos( $error_message, 'wp_error' ) !== false ) {
			return 'database_error';
		}

		return 'unknown_error';
	}

	/**
	 * Mark campaign as completed and log the reason.
	 *
	 * @param int    $campaign_id Campaign ID.
	 * @param string $reason Completion reason.
	 * @return void
	 * @since x.x.x
	 */
	private function mark_campaign_completed( $campaign_id, $reason ): void {
		// Mark campaign as completed.
		wp_update_post(
			[
				'ID'          => $campaign_id,
				'post_status' => 'draft', // Set to draft to indicate completion/inactivity.
			]
		);

		// Add completion meta flags.
		Metadata::update_campaign_meta( $campaign_id, 'campaignCompleted', true );
		Metadata::update_campaign_meta( $campaign_id, 'completedAt', current_time( 'mysql' ) );
		Metadata::update_campaign_meta( $campaign_id, 'completionReason', $reason );

		// Log completion.
		if ( $reason === 'max_failures_exceeded' ) {
			$posts_failed = Metadata::get_campaign_meta( $campaign_id, 'postsFailed' );
			$max_failures = Metadata::get_campaign_meta( $campaign_id, 'maxFailures' );

			wpaib_log_campaign_error(
				$campaign_id,
				'campaign_terminated',
				sprintf(
					/* translators: %1$d is the number of posts failed, %2$d is the maximum number of failures. */
					__( 'Campaign terminated: Maximum failures reached (%1$d/%2$d). Please check your settings and try again.', 'wp-ai-blogger' ),
					$posts_failed,
					$max_failures
				),
				[
					'termination_reason' => $reason,
					'posts_failed'       => $posts_failed,
					'max_failures'       => $max_failures,
				]
			);
		}

		// Clear any scheduled events since campaign is now complete.
		wp_clear_scheduled_hook( 'wpaib_create_single_post', [ $campaign_id ] );
	}
}
