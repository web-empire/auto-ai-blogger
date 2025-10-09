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
class CronHandler {
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

			$wp_status   = $campaign->post_status;
			$meta_status = Metadata::get_campaign_meta( $campaign_id, 'status' );
			$is_active   = ( $meta_status === 'publish' || $wp_status === 'publish' );

			if ( ! $is_active ) {
				return;
			}

			$result = $this->generate_post_from_campaign( $campaign_id );

			if ( $result['success'] ) {
				$this->schedule_next_post( $campaign_id );
			}
		} catch ( \Exception $e ) {
			return;
		}
	}

	/**
	 * Generate a post from campaign data.
	 *
	 * @param int $campaign_id The ID of the campaign.
	 * @return array An array containing the success status and message.
	 * @since x.x.x
	 */
	public function generate_post_from_campaign( $campaign_id ): array {
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
					'success' => false,
					'message' => __( 'No keywords found for campaign', 'wp-ai-blogger' ),
				];
			}

			$api_response = $this->call_post_creation_api( $campaign_id, $keywords, $max_words, $max_title_words );

			if ( ! $api_response['success'] ) {
				return [
					'success' => false,
					'message' => 'API call failed: ' . $api_response['message'],
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
				return [
					'success' => false,
					'message' => 'Failed to create WordPress post: ' . ( is_wp_error( $post_id ) ? $post_id->get_error_message() : 'Unknown error' ),
				];
			}

			if ( ! empty( $category ) ) {
				wp_set_post_categories( $post_id, [ $category ] );
			}
			if ( ! empty( $tag ) ) {
				wp_set_post_tags( $post_id, $tag );
			}

			// Add campaign reference meta to the post
			add_post_meta( $post_id, 'wp_aib_reference', 1 );
			add_post_meta( $post_id, 'wp_aib_campaign_id', $campaign_id );

			$posts_created = Metadata::get_campaign_meta( $campaign_id, 'postsCreated' );
			Metadata::update_campaign_meta( $campaign_id, 'postsCreated', intval( $posts_created ) + 1 );
			Metadata::update_campaign_meta( $campaign_id, 'lastPostID', $post_id );
			Metadata::update_campaign_meta( $campaign_id, 'lastRun', current_time( 'mysql' ) );

			return [
				'success' => true,
				'message' => "Post created successfully with ID: {$post_id}",
				'post_id' => $post_id,
			];

		} catch ( \Exception $e ) {
			return [
				'success' => false,
				'message' => 'Exception: ' . $e->getMessage(),
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
				return [
					'success' => false,
					'message' => $response->get_error_message(),
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
	 * @param int $campaign_id Campaign ID.
	 * @return void
	 * @since x.x.x
	 */
	private function schedule_next_post( $campaign_id ): void {
		try {
			$repeat_interval = Metadata::get_campaign_meta( $campaign_id, 'repeatInterval' );
			$repeat_unit     = Metadata::get_campaign_meta( $campaign_id, 'repeatUnit' );
			$posts_target    = Metadata::get_campaign_meta( $campaign_id, 'postsTarget' );
			$posts_created   = Metadata::get_campaign_meta( $campaign_id, 'postsCreated' );

			if ( $posts_target > 0 && $posts_created >= $posts_target ) {
				return;
			}

			$interval_seconds = $this->get_interval_seconds( $repeat_interval, $repeat_unit );
			$next_run         = time() + $interval_seconds;

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

		switch ( $unit ) {
			case 'hour':
				return $interval * HOUR_IN_SECONDS;
			case 'day':
				return $interval * DAY_IN_SECONDS;
			case 'week':
				return $interval * WEEK_IN_SECONDS;
			case 'month':
				return $interval * MONTH_IN_SECONDS;
			default:
				return $interval * DAY_IN_SECONDS;
		}
	}
}
