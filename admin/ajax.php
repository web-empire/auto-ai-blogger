<?php
/**
 * Admin AJAX.
 *
 * @package wp-ai-blogger
 * @since 1.0.0
 */

namespace WPAIBlogger\Admin;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Helper;
use WPAIBlogger\Inc\Utils\Metadata;
use WPAIBlogger\Inc\Utils\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Initialize setup
 *
 * @since 1.0.0
 * @package wp-ai-blogger
 */

defined( 'ABSPATH' ) || exit;

/**
 * This class setup all admin AJAX action
 *
 * @class Ajax
 */
class Ajax {
	use Get_Instance;

	/**
	 * Holds all AJAX action events.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var array
	 */
	public $ajax_events = [
		'wpaib_update_admin_setting',
		'wpaib_create_campaign',
		'wpaib_update_campaign',
		'wpaib_get_campaign_metadata',
		'wpaib_create_post',
		'wpaib_run_campaign',
		'wpaib_get_campaign_analytics',
	];

	/**
	 * Holds all nonce for AJAX events.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var array
	 */
	public static $nonce = [];

	/**
	 * Errors
	 *
	 * @access private
	 * @var array Errors strings.
	 * @since 1.0.0
	 */
	private $errors = [];

	/**
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		$this->errors = [
			'permission' => __( 'Sorry, you are not allowed to do this operation.', 'wp-ai-blogger' ),
			'nonce'      => __( 'Nonce validation failed', 'wp-ai-blogger' ),
			'default'    => __( 'Sorry, something went wrong.', 'wp-ai-blogger' ),
			'success'    => __( 'Successfully saved data!', 'wp-ai-blogger' ),
		];

		/* Initialize AJAX events */
		foreach ( $this->ajax_events as $action ) {
			add_action( 'wp_ajax_' . $action, [ $this, $action ] );
		}
	}

	/**
	 * Get error message.
	 *
	 * @param string $type Message type.
	 * @return string
	 * @access public
	 * @since 1.0.0
	 */
	public function get_error_msg( $type ) {

		if ( ! isset( $this->errors[ $type ] ) ) {
			$type = 'default';
		}

		return $this->errors[ $type ];
	}

	/**
	 * Handler to update admin app settings.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_update_admin_setting(): void {
		if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$type_settings  = Settings::get_all_type_wise_settings();
		$sub_option_key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';

		if ( ! empty( $_POST['value'] ) ) {
			if ( ! empty( $type_settings[ $sub_option_key ] ) ) {
				$sub_option_value = Settings::sanitize_data( $_POST['value'], $type_settings[ $sub_option_key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in Settings::sanitize_data.
			} else {
				$sub_option_value = Settings::sanitize_data( $_POST['value'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in Settings::sanitize_data.
			}
		}

		Helper::update_option( $sub_option_key, $sub_option_value );

		wp_send_json_success( [ 'message' => $this->get_error_msg( 'success' ) ] );
	}

	/**
	 * Handler to create campaign.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_create_campaign(): void {
		if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$campaign_details = isset( $_POST['value'] ) ? wp_unslash( $_POST['value'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in wp_unslash.
		$campaign_details = json_decode( $campaign_details, true );

		$campaign_details        = Metadata::sanitize_data( $campaign_details, 'array' );
		$formatted_campaign_data = Metadata::format_data( $campaign_details );

		// Create a new campaign.
		$campaign_id = \wp_insert_post(
			[
				'post_title'   => $formatted_campaign_data['title'],
				'post_content' => $formatted_campaign_data['content'],
				'post_status'  => $formatted_campaign_data['status'],
				'post_type'    => WP_AI_BLOGGER_CPT_CAMPAIGN,
				'meta_input'   => $formatted_campaign_data['meta_input'],
			]
		);

		if ( is_wp_error( $campaign_id ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		// Add schedule data in DB separately to manage effectively.
		if ( ! empty( $formatted_campaign_data['meta_input']['frequency'] ) ) {
			wpaib_update_schedules( $campaign_id, $formatted_campaign_data['meta_input']['frequency'] );
		}

		wp_send_json_success(
			[
				'message'     => $this->get_error_msg( 'success' ),
				'campaign_id' => $campaign_id,
			]
		);
	}

	/**
	 * Handler to update campaign.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_update_campaign(): void {
		if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$campaign_details = isset( $_POST['value'] ) ? wp_unslash( $_POST['value'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in wp_unslash.
		$campaign_details = json_decode( $campaign_details, true );

		$campaign_id = absint( $campaign_details['id'] ?? 0 );
		if ( ! $campaign_id ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		$campaign_details        = Metadata::sanitize_data( $campaign_details, 'array' );
		$formatted_campaign_data = Metadata::format_data( $campaign_details );

		// Update the campaign.
		$updated = \wp_update_post(
			[
				'ID'           => $campaign_id,
				'post_title'   => $formatted_campaign_data['title'],
				'post_content' => $formatted_campaign_data['content'],
				'post_status'  => $formatted_campaign_data['status'],
				'meta_input'   => $formatted_campaign_data['meta_input'],
			]
		);

		if ( is_wp_error( $updated ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		// Add schedule data in DB separately to manage effectively.
		if ( ! empty( $formatted_campaign_data['meta_input']['frequency'] ) ) {
			wpaib_update_schedules( $campaign_id, $formatted_campaign_data['meta_input']['frequency'] );
		}

		if ( $updated ) {
			wp_send_json_success( [ 'message' => $this->get_error_msg( 'success' ) ] );
		} else {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}

	/**
	 * Handler to get campaign metadata in drawer edit settings.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_get_campaign_metadata(): void {
		if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$campaign_id = absint( $_POST['campaign_id'] ?? 0 );
		if ( ! $campaign_id ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		wp_send_json_success( Metadata::get_campaign_data( $campaign_id, true ) );
	}

	/**
	 * Handler to create post.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_create_post(): void {
		if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$post_data = isset( $_POST['post_data'] ) ? wp_unslash( $_POST['post_data'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in wp_unslash.
		$post_data = json_decode( $post_data, true );
		if ( ! is_array( $post_data ) || empty( $post_data['title'] ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		$post_data = Metadata::sanitize_data( $post_data, 'array' );
		$meta_data = ! empty( $post_data['metadata'] ) ? json_decode( $post_data['metadata'], true ) : [];
		$meta_data = Metadata::sanitize_data( $meta_data, 'array' );

		// Create a new post.
		$post_id = \wp_insert_post(
			[
				'post_title'   => $post_data['title'],
				'post_content' => $post_data['post_content'],
				'post_status'  => $post_data['status'],
				'post_type'    => $post_data['post_type'] ?? 'post',
				'meta_input'   => $meta_data,
			]
		);
		if ( is_wp_error( $post_id ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		if ( $post_id ) {
			wp_send_json_success(
				[
					'message' => $this->get_error_msg( 'success' ),
					'post_id' => $post_id,
				]
			);
		}
	}

	/**
	 * Handler to run campaign.
	 *
	 * @since x.x.x
	 * @return void
	 */
	public function wpaib_run_campaign(): void {
		if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;
		if ( ! $campaign_id ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		$post_id = wpaib_create_blog_post( $campaign_id );

		if ( is_wp_error( $post_id ) ) {
			wp_send_json_error( [ 'message' => $post_id->get_error_message() ] );
		}

		if ( $post_id ) {
			wp_send_json_success(
				[
					'message' => $this->get_error_msg( 'success' ),
					'post_id' => $post_id,
				]
			);
		} else {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}

	/**
	 * Handler to get campaign analytics data.
	 *
	 * @since x.x.x
	 * @return void
	 */
	public function wpaib_get_campaign_analytics(): void {
		if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;
		if ( ! $campaign_id ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		$published_posts = get_posts(
			[
				'post_type'              => 'any',
				'post_status'            => 'publish',
				'meta_query'             => [
					[
						'key'     => 'wp_aib_campaign_id',
						'value'   => $campaign_id,
						'compare' => '=',
					],
				],
				'numberposts'            => -1,
				'fields'                 => 'ids',
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			]
		);

		// Calculate total views (basic implementation - can be enhanced with analytics plugins).
		$total_views = 0;
		foreach ( $published_posts as $post_id ) {
			$views = absint( get_post_meta( $post_id, 'post_views_count', true ) ?? 0 );
			if ( $views ) {
				$total_views += $views;
			}
		}

		// Calculate total comments.
		$total_comments = 0;
		if ( ! empty( $published_posts ) ) {
			$comment_count  = get_comments(
				[
					'post__in' => $published_posts,
					'count'    => true,
					'status'   => 'approve',
				]
			);
			$total_comments = absint( $comment_count );
		}

		// Get campaign metadata.
		$campaign_meta = Metadata::get_campaign_data( $campaign_id );
		$posts_target  = absint( $campaign_meta['postsTarget'] ?? 0 );
		$posts_created = count( $published_posts );

		// Calculate success rate.
		$success_rate = $posts_target > 0 ? round( $posts_created / $posts_target * 100 ) : 100;

		// Get campaign health.
		$health = __( 'Good', 'wp-ai-blogger' );
		if ( $success_rate >= 90 ) {
			$health = __( 'Excellent', 'wp-ai-blogger' );
		} elseif ( $success_rate >= 70 ) {
			$health = __( 'Good', 'wp-ai-blogger' );
		} elseif ( $success_rate >= 50 ) {
			$health = __( 'Warning', 'wp-ai-blogger' );
		} else {
			$health = __( 'Poor', 'wp-ai-blogger' );
		}

		// Calculate days active.
		$campaign_post = get_post( $campaign_id );
		$days_active   = 0;
		if ( $campaign_post ) {
			$created_date = new \DateTime( $campaign_post->post_date );
			$current_date = new \DateTime();
			$days_active  = $created_date->diff( $current_date )->days;
		}

		// Get author name.
		$author_id   = $campaign_meta['author'] ?? get_current_user_id();
		$author_data = get_userdata( $author_id );
		$author_name = $author_data ? $author_data->display_name : __( 'Unknown', 'wp-ai-blogger' );

		// Get top performing posts.
		$top_posts = [];
		if ( ! empty( $published_posts ) ) {
			$posts_with_views = [];
			foreach ( $published_posts as $post_id ) {
				$views = absint( get_post_meta( $post_id, 'post_views_count', true ) ?? 0 );
				$post  = get_post( $post_id );
				if ( $post ) {
					$posts_with_views[] = [
						'id'    => $post_id,
						'title' => $post->post_title,
						'views' => $views,
						'date'  => strtotime( $post->post_date ),
					];
				}
			}

			// Sort by views and get top 5.
			usort(
				$posts_with_views,
				static function( $a, $b ) {
					return $b['views'] - $a['views'];
				}
			);

			$top_posts = array_slice( $posts_with_views, 0, 5 );
		}

		$analytics_data = [
			'publishedPosts' => $posts_created,
			'totalViews'     => $total_views,
			'totalComments'  => $total_comments,
			'successRate'    => $success_rate,
			'health'         => $health,
			'daysActive'     => $days_active,
			'authorName'     => $author_name,
			'topPosts'       => $top_posts,
		];

		wp_send_json_success( $analytics_data );
	}
}
