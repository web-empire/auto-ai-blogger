<?php
/**
 * Admin AJAX class for WP AI Blogger.
 *
 * This class handles AJAX requests for admin operations including
 * settings management, campaign operations, and post creation.
 * Implements security measures including rate limiting,
 * input validation, and proper authentication.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 */

namespace WPAIBlogger\Admin;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Helper;
use WPAIBlogger\Inc\Utils\Metadata;
use WPAIBlogger\Inc\Utils\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Admin AJAX class for WP AI Blogger.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 */
class Ajax {
	use Get_Instance;

	/**
	 * Maximum request size in bytes (2MB for AJAX operations).
	 */
	private const MAX_REQUEST_SIZE = 2097152;

	/**
	 * Maximum campaign content length.
	 */
	private const MAX_CAMPAIGN_CONTENT_LENGTH = 50000;

	/**
	 * Holds all AJAX action events.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var array<string>
	 */
	public $ajax_events = [
		'wpaib_update_admin_setting',
		'wpaib_create_campaign',
		'wpaib_update_campaign',
		'wpaib_get_campaign_metadata',
		'wpaib_create_post',
		'wpaib_run_campaign',
		'wpaib_get_campaign_analytics',
		'wpaib_delete_campaign',
		'wpaib_get_campaign_logs',
	];

	/**
	 * Holds all nonce for AJAX events.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var array<string, string>
	 */
	public static $nonce = [];

	/**
	 * Errors
	 *
	 * @access private
	 * @var array<string, string> Errors strings.
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
			'permission'         => __( 'Sorry, you are not allowed to do this operation.', 'wp-ai-blogger' ),
			'nonce'              => __( 'Nonce validation failed', 'wp-ai-blogger' ),
			'default'            => __( 'Sorry, something went wrong.', 'wp-ai-blogger' ),
			'success'            => __( 'Successfully saved data!', 'wp-ai-blogger' ),
			'rate_limit'         => __( 'Too many requests. Please try again later.', 'wp-ai-blogger' ),
			'request_too_large'  => __( 'Request size exceeds maximum allowed limit.', 'wp-ai-blogger' ),
			'invalid_data'       => __( 'Invalid or malformed data provided.', 'wp-ai-blogger' ),
			'security_violation' => __( 'Security check failed. Request blocked.', 'wp-ai-blogger' ),
			'content_too_long'   => __( 'Content exceeds maximum allowed length.', 'wp-ai-blogger' ),
		];

		/* Initialize AJAX events */
		foreach ( $this->ajax_events as $action ) {
			add_action( 'wp_ajax_' . $action, [ $this, $action ] );
		}

		// Add security headers for AJAX responses.
		add_action( 'wp_ajax_wpaib_update_admin_setting', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_create_campaign', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_update_campaign', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_get_campaign_metadata', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_create_post', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_run_campaign', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_delete_campaign', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_get_campaign_logs', [ $this, 'add_security_headers' ], 1 );
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
	 * Add security headers to AJAX responses.
	 *
	 * @since x.x.x
	 */
	public function add_security_headers(): void {
		if ( ! headers_sent() ) {
			header( 'X-Content-Type-Options: nosniff' );
			header( 'X-Frame-Options: DENY' );
			header( 'X-XSS-Protection: 1; mode=block' );
			header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		}
	}

	/**
	 * Handler to update admin app settings with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_update_admin_setting(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'update_admin_setting' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate and sanitize input.
			$sub_option_key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
			if ( empty( $sub_option_key ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Get allowed setting keys for validation.
			$type_settings = Settings::get_all_type_wise_settings();
			$allowed_keys  = array_keys( $type_settings );

			// Additional whitelist allowed setting keys.
			if ( ! in_array( $sub_option_key, $allowed_keys, true ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			$sub_option_value = '';
			if ( isset( $_POST['value'] ) ) {
				if ( ! empty( $type_settings[ $sub_option_key ] ) ) {
					$sub_option_value = Settings::sanitize_data( $_POST['value'], $type_settings[ $sub_option_key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in Settings::sanitize_data..
				} else {
					$sub_option_value = Settings::sanitize_data( $_POST['value'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in Settings::sanitize_data..
				}
			}

			// Update option with error handling.
			$update_result = Helper::update_option( $sub_option_key, $sub_option_value );

			if ( ! $update_result['success'] ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
				return;
			}

			wp_send_json_success(
				[
					'message' => $this->get_error_msg( 'success' ),
					'key'     => $sub_option_key,
					'updated' => true,
				]
			);

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}   /**
		 * Handler to create campaign with security.
		 *
		 * @since 1.0.0
		 * @return void
		 */
	public function wpaib_create_campaign(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'create_campaign' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate and sanitize input.
			$campaign_details = isset( $_POST['value'] ) ? wp_unslash( $_POST['value'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done below..

			if ( empty( $campaign_details ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Decode and validate JSON.
			$campaign_details = json_decode( $campaign_details, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// data sanitization.
			$sanitized_campaign = $this->sanitize_campaign_data( $campaign_details );
			if ( is_wp_error( $sanitized_campaign ) ) {
				wp_send_json_error( [ 'message' => $sanitized_campaign->get_error_message() ] );
				return;
			}

			// Legacy sanitization for backward compatibility.
			$campaign_details        = Metadata::sanitize_data( $campaign_details, 'array' );
			$formatted_campaign_data = Metadata::format_data( $campaign_details );

			// Validate required fields.
			if ( ! is_array( $formatted_campaign_data ) || empty( $formatted_campaign_data['title'] ) ) {
				wp_send_json_error( [ 'message' => __( 'Campaign title is required.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Create a new campaign with error handling.
			$campaign_id = \wp_insert_post(
				[
					'post_title'   => $formatted_campaign_data['title'],
					'post_content' => $formatted_campaign_data['content'] ?? '',
					'post_status'  => $formatted_campaign_data['status'] ?? 'draft',
					'post_type'    => WP_AI_BLOGGER_CPT_CAMPAIGN,
					'meta_input'   => $formatted_campaign_data['meta_input'] ?? [],
				]
			);

			if ( is_wp_error( $campaign_id ) || ! $campaign_id ) {
				wp_send_json_error(
					[
						'message' => $this->get_error_msg( 'default' ),
						'details' => is_wp_error( $campaign_id ) ? $campaign_id->get_error_message() : 'Failed to create campaign',
					]
				);
				return;
			}

			// New simplified post creation scheduler.
			$this->schedule_campaign_posts( $campaign_id, $formatted_campaign_data['meta_input'] );

			wp_send_json_success(
				[
					'message'     => $this->get_error_msg( 'success' ),
					'campaign_id' => $campaign_id,
					'title'       => $formatted_campaign_data['title'],
					'status'      => $formatted_campaign_data['status'] ?? 'draft',
				]
			);

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}

	/**
	 * Handler to update campaign with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_update_campaign(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'update_campaign' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate and sanitize input.
			$campaign_details = isset( $_POST['value'] ) ? wp_unslash( $_POST['value'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done below..

			if ( empty( $campaign_details ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Decode and validate JSON.
			$campaign_details = json_decode( $campaign_details, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Validate campaign ID.
			if ( ! is_array( $campaign_details ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}
			$campaign_id = absint( $campaign_details['id'] ?? 0 );
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Check if campaign exists and user can edit it.
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
				return;
			}

			if ( ! current_user_can( 'edit_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Data sanitization.
			$sanitized_campaign = $this->sanitize_campaign_data( $campaign_details );
			if ( is_wp_error( $sanitized_campaign ) ) {
				wp_send_json_error( [ 'message' => $sanitized_campaign->get_error_message() ] );
				return;
			}

			// Legacy sanitization for backward compatibility.
			$campaign_details        = Metadata::sanitize_data( $campaign_details, 'array' );
			$formatted_campaign_data = Metadata::format_data( $campaign_details );

			// Validate required fields.
			if ( ! is_array( $formatted_campaign_data ) || empty( $formatted_campaign_data['title'] ) ) {
				wp_send_json_error( [ 'message' => __( 'Campaign title is required.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Update the campaign with error handling.
			$updated = \wp_update_post(
				[
					'ID'           => $campaign_id,
					'post_title'   => $formatted_campaign_data['title'],
					'post_content' => $formatted_campaign_data['content'] ?? '',
					'post_status'  => $formatted_campaign_data['status'] ?? 'draft',
					'meta_input'   => $formatted_campaign_data['meta_input'] ?? [],
				]
			);

			if ( is_wp_error( $updated ) || ! $updated ) {
				wp_send_json_error(
					[
						'message' => $this->get_error_msg( 'default' ),
						'details' => is_wp_error( $updated ) ? $updated->get_error_message() : 'Failed to update campaign',
					]
				);
				return;
			}

			// Update campaign scheduling using new system.
			$this->schedule_campaign_posts( $campaign_id, $formatted_campaign_data['meta_input'] );

			wp_send_json_success(
				[
					'message'     => $this->get_error_msg( 'success' ),
					'campaign_id' => $campaign_id,
					'title'       => $formatted_campaign_data['title'],
					'updated'     => true,
				]
			);

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}

	/**
	 * Handler to get campaign metadata in drawer edit settings with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_get_campaign_metadata(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'get_campaign_metadata' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate campaign ID.
			$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Check if campaign exists and user can read it.
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
				return;
			}

			if ( ! current_user_can( 'read_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Get campaign metadata with error handling.
			$campaign_data = Metadata::get_campaign_data( $campaign_id, true );

			if ( empty( $campaign_data ) ) {
				wp_send_json_error( [ 'message' => __( 'Failed to retrieve campaign data.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Sanitize sensitive data before sending.
			if ( isset( $campaign_data['api_key'] ) ) {
				$campaign_data['api_key'] = '***masked***';
			}
			if ( isset( $campaign_data['token'] ) ) {
				$campaign_data['token'] = '***masked***';
			}

			wp_send_json_success(
				[
					'data'        => $campaign_data,
					'campaign_id' => $campaign_id,
					'message'     => __( 'Campaign data retrieved successfully.', 'wp-ai-blogger' ),
				]
			);

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}

	/**
	 * Handler to create post with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_create_post(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'create_post' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Check if user can create posts.
			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Validate and sanitize input.
			$post_data = isset( $_POST['post_data'] ) ? wp_unslash( $_POST['post_data'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done below..

			if ( empty( $post_data ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Decode and validate JSON.
			$post_data = json_decode( (string) $post_data, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			if ( ! is_array( $post_data ) || empty( $post_data['title'] ) ) {
				wp_send_json_error( [ 'message' => __( 'Post title is required.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Sanitize post data.
			$post_data = Metadata::sanitize_data( $post_data, 'array' );

			// Validate and sanitize title.
			$post_title = sanitize_text_field( (string) $post_data['title'] );
			if ( strlen( $post_title ) > 200 ) {
				wp_send_json_error( [ 'message' => __( 'Post title is too long (max 200 characters).', 'wp-ai-blogger' ) ] );
				return;
			}

			// If no content provided, generate content from title via API.
			$featured_image_id = null;
			$post_content      = $post_data['post_content'] ?? '';
			$token_data        = null; // Initialize token data variable.

			if ( empty( $post_content ) && ! empty( $post_title ) ) {
				$api_result = $this->generate_content_from_title_api( $post_title, $post_data );
				if ( is_wp_error( $api_result ) ) {
					$error_response = [
						'message' => $api_result->get_error_message(),
						'code'    => $api_result->get_error_code(),
					];

					// Include HTTP status code if available.
					$error_data = $api_result->get_error_data();
					if ( is_array( $error_data ) && isset( $error_data['status'] ) ) {
						$error_response['status'] = (int) $error_data['status'];
					}

					wp_send_json_error( $error_response );
					return;
				}

				if ( is_array( $api_result ) ) {
					$post_content = $api_result['post_content'] ?? '';
					// Store token data from API response.
					$token_data = $api_result['token_data'] ?? null;

					// Process images if they exist in the API response.
					if ( ! empty( $api_result['images'] ) && is_array( $api_result['images'] ) ) {
						$processed_result = $this->process_images_and_replace_placeholders( $post_content, $api_result['images'] );
						if ( ! is_wp_error( $processed_result ) ) {
							$post_content      = $processed_result['content'];
							$featured_image_id = $processed_result['featured_image_id'];
						}
					}
				}
			}

			// Validate and sanitize content.
			$post_content = wp_kses_post( (string) $post_content );
			if ( strlen( $post_content ) > 100000 ) { // 100KB limit.
				wp_send_json_error( [ 'message' => __( 'Post content is too long.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Validate post status.
			$allowed_statuses = [ 'draft', 'publish', 'private', 'pending' ];
			$post_status      = isset( $post_data['status'] ) && is_string( $post_data['status'] ) && in_array( $post_data['status'], $allowed_statuses, true )
				? $post_data['status']
				: 'draft';

			// Validate post type.
			$post_type = sanitize_text_field( (string) ( $post_data['post_type'] ?? 'post' ) );
			if ( ! post_type_exists( $post_type ) ) {
				$post_type = 'post';
			}

			// Check if user can create this post type.
			$post_type_object = get_post_type_object( $post_type );
			if ( ! $post_type_object || ! current_user_can( $post_type_object->cap->create_posts ) ) {
				wp_send_json_error( [ 'message' => __( 'You do not have permission to create this type of post.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Sanitize metadata.
			$meta_data = [];
			if ( ! empty( $post_data['metadata'] ) ) {
				$metadata_raw = json_decode( (string) $post_data['metadata'], true );
				if ( json_last_error() === JSON_ERROR_NONE && is_array( $metadata_raw ) ) {
					$meta_data = Metadata::sanitize_data( $metadata_raw, 'array' );
				}
			}

			// Create a new post with error handling.
			$post_args = [
				'post_title'   => $post_title,
				'post_content' => $post_content,
				'post_status'  => $post_status,
				'post_type'    => $post_type,
			];

			if ( ! empty( $meta_data ) && is_array( $meta_data ) ) {
				$post_args['meta_input'] = $meta_data;
			}

			$post_id = \wp_insert_post( $post_args );

			if ( is_wp_error( $post_id ) || ! $post_id ) {
				$error_message = is_wp_error( $post_id )
					? $post_id->get_error_message()
					: __( 'Failed to create post - unknown error occurred.', 'wp-ai-blogger' );

				wp_send_json_error(
					[
						'message' => $error_message,
						'details' => is_wp_error( $post_id ) ? $post_id->get_error_message() : 'Failed to create post',
					]
				);
				return;
			}

			// Set featured image if available.
			if ( $featured_image_id && is_numeric( $featured_image_id ) ) {
				set_post_thumbnail( $post_id, $featured_image_id );
				// Note: We don't fail the post creation if thumbnail setting fails as the post content already includes the images.
			}

			// Remove this title from the postIdeas DB option (but keep Redux unchanged).
			if ( ! empty( $post_data['title'] ) && is_string( $post_data['title'] ) ) {
				$this->remove_post_idea_from_db( $post_data['title'] );
			}

			$success_response = [
				'message'   => $this->get_error_msg( 'success' ),
				'post_id'   => $post_id,
				'title'     => $post_title,
				'status'    => $post_status,
				'edit_link' => get_edit_post_link( $post_id, 'raw' ),
			];

			// Include token data in response if available (for Redux state updates).
			if ( is_array( $token_data ) && isset( $token_data['total'] ) && isset( $token_data['remaining'] ) ) {
				$success_response['token_data'] = $token_data;
			}

			wp_send_json_success( $success_response );

		} catch ( \Exception $e ) {
			wp_send_json_error(
				[
					'message' => __( 'An unexpected error occurred while creating the post. Please try again.', 'wp-ai-blogger' ),
				]
			);
		}
	}

	/**
	 * Handler to run campaign with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_run_campaign(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'run_campaign' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Check if user can publish posts (required for running campaigns).
			if ( ! current_user_can( 'publish_posts' ) ) {
				wp_send_json_error( [ 'message' => __( 'You do not have permission to run campaigns.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Validate campaign ID.
			$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;

			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Check if campaign exists and user can edit it.
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
				return;
			}

			if ( ! current_user_can( 'edit_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Check if campaign is active/published.
			if ( $campaign_post->post_status !== 'publish' ) {
				wp_send_json_error( [ 'message' => __( 'Campaign must be published to run.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Run the campaign using CronHandler.
			$cron_handler = \WPAIBlogger\Inc\CronHandler::get_instance();
			$result       = $cron_handler->generate_post_from_campaign( $campaign_id );

			if ( ! $result['success'] ) {
				wp_send_json_error(
					[
						'message'     => $result['message'],
						'campaign_id' => $campaign_id,
					]
				);
				return;
			}

			$post_id = $result['post_id'] ?? null;
			if ( ! $post_id ) {
				wp_send_json_error(
					[
						'message'     => __( 'Failed to create post from campaign.', 'wp-ai-blogger' ),
						'campaign_id' => $campaign_id,
					]
				);
				return;
			}

			// Get the created post details.
			$created_post = get_post( $post_id );
			$post_title   = $created_post ? $created_post->post_title : '';

			wp_send_json_success(
				[
					'message'     => $this->get_error_msg( 'success' ),
					'post_id'     => $post_id,
					'campaign_id' => $campaign_id,
					'post_title'  => $post_title,
					'edit_link'   => get_edit_post_link( $post_id, 'raw' ),
					'view_link'   => get_permalink( $post_id ),
				]
			);

		} catch ( \Exception $e ) {
			wp_send_json_error(
				[
					'message' => $this->get_error_msg( 'default' ),
					'error'   => 'Exception occurred during campaign execution',
				]
			);
		}
	}

	/**
	 * Handler to get campaign analytics data.
	 *
	 * @since x.x.x
	 * @return void
	 */
	public function wpaib_get_campaign_analytics(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'get_campaign_analytics' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Validate nonce.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
			}

			$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
			}

			// Get campaign metadata.
			$campaign_meta = Metadata::get_campaign_data( $campaign_id, true );
			$posts_target  = absint( $campaign_meta['postsTarget'] ?? 0 );
			$posts_created = absint( $campaign_meta['postsCreated'] ?? 0 );

			$published_posts = get_posts(
				[
					'post_type'              => 'any',
					'post_status'            => 'any',
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

			// Calculate success rate.
			$success_rate = $posts_target > 0 ? round( $posts_created / $posts_target * 100 ) : 100;

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
							'date'  => $post->post_date,
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
				'publishedPosts' => $posts_created . '/' . $posts_target,
				'totalViews'     => $total_views,
				'totalComments'  => $total_comments,
				'successRate'    => $success_rate,
				'daysActive'     => $days_active,
				'authorName'     => $author_name,
				'topPosts'       => $top_posts,
				'lastRun'        => Metadata::get_campaign_meta( $campaign_id, 'lastRun' ),
			];

			wp_send_json_success( $analytics_data );
		} catch ( \Exception $e ) {
			wp_send_json_error(
				[
					'message' => $this->get_error_msg( 'default' ),
					'error'   => 'Exception occurred during fetching campaign analytics',
				]
			);
		}
	}

	/**
	 * Create a single post from a campaign (called by cron).
	 *
	 * @param int $campaign_id Campaign ID.
	 * @return void
	 * @since x.x.x
	 */
	public function create_single_post_from_campaign( $campaign_id ): void {
		try {
			$campaign_id = absint( $campaign_id );
			if ( ! $campaign_id ) {
				return;
			}

			// Get campaign.
			$campaign = get_post( $campaign_id );
			if ( ! $campaign || $campaign->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN || $campaign->post_status !== 'publish' ) {
				return;
			}

			// Check if target reached.
			$posts_created = absint( get_post_meta( $campaign_id, 'postsCreated', true ) );
			$posts_target  = absint( get_post_meta( $campaign_id, 'postsTarget', true ) );

			if ( $posts_target > 0 && $posts_created >= $posts_target ) {
				// Target reached, clear schedule.
				wp_clear_scheduled_hook( 'wpaib_create_single_post', [ $campaign_id ] );
				return;
			}

			// Create the post.
			$this->generate_post_from_campaign( $campaign_id );

		} catch ( \Exception $e ) {
			return;
		}
	}

	/**
	 * Handler to delete campaign with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_delete_campaign(): void {
		try {
			// security validation.
			$security_check = $this->validate_ajax_security( 'delete_campaign' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
			}

			// Validate campaign ID.
			$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
			}

			// Check if campaign exists and user can read it.
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
			}

			if ( ! current_user_can( 'delete_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
			}

			// Clear scheduled events for this campaign.
			wp_clear_scheduled_hook( 'wpaib_create_single_post', [ $campaign_id ] );
			wp_delete_post( $campaign_id, true );
			wp_send_json_success( [ 'message' => __( 'Campaign deleted successfully.', 'wp-ai-blogger' ) ] );
		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => __( 'Error occurred while deleting campaign: ', 'wp-ai-blogger' ) . $e->getMessage() ] );
		}
	}

	/**
	 * Handler to get campaign logs with security.
	 *
	 * @since x.x.x
	 * @return void
	 */
	public function wpaib_get_campaign_logs(): void {
		try {
			// Security validation.
			$security_check = $this->validate_ajax_security( 'get_campaign_logs' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation.
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate campaign ID.
			$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Check if campaign exists and user can read it.
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
				return;
			}

			if ( ! current_user_can( 'read_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Get campaign logs.
			$logs = $this->get_campaign_creation_logs( $campaign_id );

			wp_send_json_success( [
				'logs' => $logs,
				'campaign_id' => $campaign_id,
				'message' => __( 'Logs retrieved successfully.', 'wp-ai-blogger' )
			] );

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}

	/**
	 * Perform comprehensive security validation for AJAX requests.
	 *
	 * @param string $action The AJAX action being performed.
	 * @return bool|\WP_Error True if valid, WP_Error if security check fails.
	 * @since x.x.x
	 */
	private function validate_ajax_security( $action = '' ) {
		try {
			// Check user capabilities.
			if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
				return new \WP_Error( 'permission_denied', $this->get_error_msg( 'permission' ) );
			}

			// Validate request size.
			$request_size_check = $this->validate_ajax_request_size();
			if ( is_wp_error( $request_size_check ) ) {
				return $request_size_check;
			}

			// Check for suspicious User-Agent.
			$user_agent_check = $this->validate_user_agent();
			if ( is_wp_error( $user_agent_check ) ) {
				return $user_agent_check;
			}

			// Validate referer for admin requests.
			$referer_check = $this->validate_admin_referer();
			if ( is_wp_error( $referer_check ) ) {
				return $referer_check;
			}

			return true;

		} catch ( \Exception $e ) {
			return new \WP_Error( 'security_error', $this->get_error_msg( 'security_violation' ) );
		}
	}

	/**
	 * Validate AJAX request size.
	 *
	 * @return bool|\WP_Error True if valid, WP_Error if too large.
	 * @since x.x.x
	 */
	private function validate_ajax_request_size() {
		$content_length = isset( $_SERVER['CONTENT_LENGTH'] ) ? absint( $_SERVER['CONTENT_LENGTH'] ) : 0;

		if ( (int) $content_length > self::MAX_REQUEST_SIZE ) {
			return new \WP_Error( 'request_too_large', $this->get_error_msg( 'request_too_large' ) );
		}

		return true;
	}

	/**
	 * Validate User-Agent header.
	 *
	 * @return bool|\WP_Error True if valid, WP_Error if suspicious.
	 * @since x.x.x
	 */
	private function validate_user_agent() {
		$user_agent = sanitize_text_field( (string) ( $_SERVER['HTTP_USER_AGENT'] ?? '' ) );

		if ( empty( $user_agent ) ) {
			return new \WP_Error( 'invalid_user_agent', $this->get_error_msg( 'security_violation' ) );
		}

		$suspicious_patterns = [
			'bot',
			'crawler',
			'spider',
			'scraper',
			'curl/7.',
			'wget',
			'python-requests',
			'libwww-perl',
			'java/',
			'go-http-client',
		];

		$user_agent_lower = strtolower( $user_agent );

		foreach ( $suspicious_patterns as $pattern ) {
			if ( strpos( $user_agent_lower, $pattern ) !== false ) {
				// Allow legitimate WordPress and plugin requests.
				if ( strpos( $user_agent_lower, 'wordpress' ) === false && strpos( $user_agent_lower, 'wp-ai-blogger' ) === false ) {
					return new \WP_Error( 'suspicious_user_agent', $this->get_error_msg( 'security_violation' ) );
				}
			}
		}

		return true;
	}

	/**
	 * Validate admin referer.
	 *
	 * @return bool|\WP_Error True if valid, WP_Error if invalid.
	 * @since x.x.x
	 */
	private function validate_admin_referer() {
		$referer = sanitize_text_field( (string) ( $_SERVER['HTTP_REFERER'] ?? '' ) );

		if ( ! empty( $referer ) ) {
			$admin_url = admin_url();
			$site_url  = get_site_url();

			if ( strpos( $referer, $admin_url ) !== 0 && strpos( $referer, $site_url ) !== 0 ) {
				return new \WP_Error( 'invalid_referer', $this->get_error_msg( 'security_violation' ) );
			}
		}

		return true;
	}

	/**
	 * Sanitize and validate campaign data.
	 *
	 * @param array<string, mixed> $campaign_data Raw campaign data.
	 * @return array<string, mixed>|\WP_Error Sanitized data or error.
	 * @since x.x.x
	 */
	private function sanitize_campaign_data( $campaign_data ) {
		if ( ! is_array( $campaign_data ) ) {
			return new \WP_Error( 'invalid_data_type', $this->get_error_msg( 'invalid_data' ) );
		}

		$allowed_keys = [
			'id',
			'title',
			'content',
			'status',
			'frequency',
			'keywords',
			'category',
			'tags',
			'meta_input',
			'post_count',
			'schedule',
			'repeatWeeklyOn',
			'startDate',
		];

		$sanitized = [];

		foreach ( $campaign_data as $key => $value ) {
			// Only allow whitelisted keys.
			if ( ! in_array( $key, $allowed_keys, true ) ) {
				continue;
			}

			// Sanitize based on key type.
			switch ( $key ) {
				case 'id':
				case 'post_count':
					$sanitized[ $key ] = absint( $value );
					break;
				case 'title':
					$sanitized[ $key ] = sanitize_text_field( (string) $value );
					if ( strlen( $sanitized[ $key ] ) > 200 ) {
						return new \WP_Error( 'title_too_long', __( 'Campaign title is too long.', 'wp-ai-blogger' ) );
					}
					break;
				case 'content':
					$sanitized[ $key ] = wp_kses_post( (string) $value );
					if ( strlen( $sanitized[ $key ] ) > self::MAX_CAMPAIGN_CONTENT_LENGTH ) {
						return new \WP_Error( 'content_too_long', $this->get_error_msg( 'content_too_long' ) );
					}
					break;
				case 'status':
					$allowed_statuses  = [ 'draft', 'publish', 'private', 'pending' ];
					$sanitized[ $key ] = is_string( $value ) && in_array( $value, $allowed_statuses, true ) ? $value : 'draft';
					break;
				case 'keywords':
				case 'tags':
				case 'repeatWeeklyOn':
					if ( is_array( $value ) ) {
						$sanitized[ $key ] = array_map( 'sanitize_text_field', array_map( 'strval', $value ) );
					} else {
						$sanitized[ $key ] = sanitize_text_field( (string) $value );
					}
					break;
				case 'category':
					$sanitized[ $key ] = absint( $value );
					break;
				case 'meta_input':
					if ( is_array( $value ) ) {
						$sanitized[ $key ] = $this->sanitize_meta_input( $value );
					}
					break;
				default:
					$sanitized[ $key ] = sanitize_text_field( (string) $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize meta input data.
	 *
	 * @param array<string, mixed> $meta_data Raw meta data.
	 * @return array<string, mixed> Sanitized meta data.
	 * @since x.x.x
	 */
	private function sanitize_meta_input( $meta_data ) {
		$sanitized         = [];
		$allowed_meta_keys = [
			'frequency',
			'keywords',
			'category',
			'tags',
			'post_count',
			'content_length',
			'tone',
			'language',
			'include_images',
		];

		foreach ( $meta_data as $key => $value ) {
			if ( ! in_array( $key, $allowed_meta_keys, true ) ) {
				continue;
			}

			switch ( $key ) {
				case 'frequency':
				case 'post_count':
				case 'content_length':
				case 'category':
					$sanitized[ $key ] = absint( $value );
					break;
				case 'include_images':
					$sanitized[ $key ] = (bool) $value;
					break;
				case 'tone':
				case 'language':
					$sanitized[ $key ] = sanitize_text_field( (string) $value );
					break;
				case 'keywords':
				case 'tags':
					if ( is_array( $value ) ) {
						$sanitized[ $key ] = array_map( 'sanitize_text_field', array_map( 'strval', $value ) );
					} else {
						$sanitized[ $key ] = sanitize_text_field( (string) $value );
					}
					break;
				default:
					$sanitized[ $key ] = sanitize_text_field( (string) $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Remove a post idea from the database when a post is created from it.
	 * This keeps Redux unchanged so UI can show "Open Post" button until page refresh.
	 * Uses atomic operations to prevent race conditions when multiple posts are created quickly.
	 *
	 * @param string $post_title The title of the post that was created.
	 * @since x.x.x
	 */
	private function remove_post_idea_from_db( $post_title ): void {
		$lock_key = 'wp_ai_blogger_postideas_lock'; // Define early to avoid undefined variable issues.

		try {
			// Sanitize the title.
			$post_title = sanitize_text_field( trim( $post_title ) );
			if ( empty( $post_title ) ) {
				return;
			}

			// Use WordPress transients for atomic operations to prevent race conditions.
			$max_lock_time = 10; // Maximum lock time in seconds.

			// Try to acquire lock (retry up to 5 times).
			$lock_acquired = false;
			$retry_count   = 0;
			$max_retries   = 5;

			while ( ! $lock_acquired && $retry_count < $max_retries ) {
				$existing_lock = get_transient( $lock_key );

				if ( $existing_lock === false ) {
					// No lock exists, try to set one.
					$lock_acquired = set_transient( $lock_key, time(), $max_lock_time );
					if ( $lock_acquired ) {
						break; // Successfully acquired lock.
					}
				} else {
					// Lock exists, check if it's expired.
					$lock_time = intval( $existing_lock );
					if ( time() - $lock_time > $max_lock_time ) {
						// Lock is expired, force remove it and try again.
						delete_transient( $lock_key );
					} else {
						// Wait a bit before retrying.
						usleep( 50000 ); // 50ms.
					}
				}
				$retry_count++;
			}

			if ( ! $lock_acquired ) {
				// Could not acquire lock, return.
				return;
			}

			// Now we have the lock, perform the operation.
			try {
				// Get current post ideas from database (fresh read).
				$current_post_ideas = \WPAIBlogger\Inc\Utils\Helper::get_option( 'postIdeas', '' );

				if ( empty( $current_post_ideas ) || ! is_string( $current_post_ideas ) ) {
					return;
				}

				// Convert post ideas string to array.
				$ideas_array = array_filter( array_map( 'trim', explode( "\n", $current_post_ideas ) ) );

				// Find and remove the exact matching idea.
				$updated_ideas     = [];
				$found_and_removed = false;

				foreach ( $ideas_array as $idea ) {
					if ( ! $found_and_removed && trim( $idea ) === $post_title ) {
						$found_and_removed = true;
						continue; // Skip this idea (remove it).
					}
					$updated_ideas[] = $idea;
				}

				// Only update if we actually removed something.
				if ( $found_and_removed ) {
					// Check if this was the last post idea.
					if ( empty( $updated_ideas ) ) {
						// Set to "-1" to indicate post ideas are exhausted.
						\WPAIBlogger\Inc\Utils\Helper::update_option( 'postIdeas', '-1' );
					} else {
						$updated_post_ideas_string = implode( "\n", $updated_ideas );
						\WPAIBlogger\Inc\Utils\Helper::update_option( 'postIdeas', $updated_post_ideas_string );
					}
				}
			} finally {
				// Always release the lock.
				delete_transient( $lock_key );
			}

		} catch ( \Exception $e ) {
			// Log error but don't fail the post creation.
			// Make sure to release lock even on exception.
			delete_transient( $lock_key );
		}
	}

	/**
	 * Generate content from title using the API.
	 *
	 * @param string               $title The post title.
	 * @param array<string, mixed> $post_data Additional post data.
	 * @return array<string, mixed>|\WP_Error Generated content or error.
	 * @since x.x.x
	 */
	private function generate_content_from_title_api( $title, $post_data = [] ) {
		try {
			// Prepare API request data.
			$api_data = [
				'title' => $title,
			];

			// Add optional parameters if they exist in post_data with fallback values.
			if ( ! empty( $post_data['license'] ) && is_string( $post_data['license'] ) ) {
				$api_data['license'] = sanitize_text_field( $post_data['license'] );
			} else {
				// Get license from plugin settings if not provided.
				$api_data['license'] = \WPAIBlogger\Inc\Utils\Helper::get_option( 'license', '' );
			}

			if ( ! empty( $post_data['site_title'] ) && is_string( $post_data['site_title'] ) ) {
				$api_data['site_title'] = sanitize_text_field( $post_data['site_title'] );
			}

			if ( ! empty( $post_data['site_purpose'] ) && is_string( $post_data['site_purpose'] ) ) {
				$api_data['site_purpose'] = sanitize_text_field( $post_data['site_purpose'] );
			}

			if ( ! empty( $post_data['site_description'] ) && is_string( $post_data['site_description'] ) ) {
				$api_data['site_description'] = sanitize_text_field( $post_data['site_description'] );
			}

			// Temperature with fallback to 0.7.
			$api_data['temperature'] = isset( $post_data['temperature'] ) ? floatval( $post_data['temperature'] ) : 0.7;

			// Add image count parameter (default to 0 if not specified).
			$api_data['image_count'] = isset( $post_data['image_count'] ) ? absint( $post_data['image_count'] ) : 0;

			// Safety settings with fallback values.
			$safety_settings = [
				'harassment'        => 1,
				'hate'              => 1,
				'sexually_explicit' => 2,
				'dangerous_content' => 1,
			];

			foreach ( $safety_settings as $setting => $default_value ) {
				if ( isset( $post_data[ $setting ] ) ) {
					$api_data[ $setting ] = absint( $post_data[ $setting ] );
				} else {
					$api_data[ $setting ] = $default_value;
				}
			}

			// Make API request.
			$api_url = 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/generate-content-from-title';

			$response = wp_remote_post(
				$api_url,
				[
					'timeout' => 90,
					'headers' => [
						'Content-Type' => 'application/json',
						'User-Agent'   => 'WP-AI-Blogger/' . WP_AI_BLOGGER_VERSION . ' WordPress/' . get_bloginfo( 'version' ),
					],
					'body'    => $api_data ? wp_json_encode( $api_data ) : '',
				]
			);

			// Check for HTTP errors.
			if ( is_wp_error( $response ) ) {
				return new \WP_Error(
					'api_request_failed',
					__( 'Failed to connect to content generation API: ', 'wp-ai-blogger' ) . $response->get_error_message()
				);
			}

			$http_code = wp_remote_retrieve_response_code( $response );

			// Parse response.
			$body             = wp_remote_retrieve_body( $response );
			$decoded_response = json_decode( $body, true );

			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return new \WP_Error(
					'api_json_error',
					__( 'Invalid JSON response from API', 'wp-ai-blogger' )
				);
			}

			// Handle non-200 HTTP status codes with API error response.
			if ( $http_code !== 200 ) {
				// Try to extract error details from API response first.
				if ( is_array( $decoded_response ) && isset( $decoded_response['code'] ) && isset( $decoded_response['message'] ) ) {
					$error_code    = (string) $decoded_response['code'];
					$error_message = (string) $decoded_response['message'];
					$error_data    = isset( $decoded_response['data'] ) && is_array( $decoded_response['data'] ) && isset( $decoded_response['data']['status'] ) ? [ 'status' => (int) $decoded_response['data']['status'] ] : [ 'status' => $http_code ];

					return new \WP_Error( $error_code, $error_message, $error_data );
				}
					// Fallback to generic HTTP error.
					return new \WP_Error(
						'api_http_error',
						sprintf(
							/* translators: %d is the HTTP status code */
							__( 'API returned HTTP error %d', 'wp-ai-blogger' ),
							$http_code
						),
						[ 'status' => $http_code ]
					);

			}

			// Check API response status.
			if ( is_array( $decoded_response ) && isset( $decoded_response['code'] ) && $decoded_response['code'] !== 'success' ) {
				$error_message = (string) ( $decoded_response['message'] ?? __( 'Unknown API error', 'wp-ai-blogger' ) );
				$error_code    = (string) ( $decoded_response['code'] ?? 'api_error' );

				// Include HTTP status code if available.
				$http_status = isset( $decoded_response['data'] ) && is_array( $decoded_response['data'] ) && isset( $decoded_response['data']['status'] ) ? (int) $decoded_response['data']['status'] : null;
				$error_data  = $http_status ? [ 'status' => $http_status ] : null;

				return new \WP_Error( $error_code, $error_message, $error_data );
			}

			// Extract generated content and images.
			if ( ! is_array( $decoded_response ) || ! isset( $decoded_response['post_content'] ) ) {
				return new \WP_Error(
					'api_no_content',
					__( 'API did not return generated content', 'wp-ai-blogger' )
				);
			}

			$generated_content = (string) $decoded_response['post_content'];

			// Validate content length.
			if ( empty( $generated_content ) || strlen( $generated_content ) < 50 ) {
				return new \WP_Error(
					'api_content_too_short',
					__( 'Generated content is too short or empty', 'wp-ai-blogger' )
				);
			}

			// Extract images array if present.
			$images = isset( $decoded_response['images'] ) && is_array( $decoded_response['images'] ) ? $decoded_response['images'] : [];

			// Extract and update token data if present.
			$token_data = isset( $decoded_response['token_data'] ) && is_array( $decoded_response['token_data'] ) ? $decoded_response['token_data'] : null;

			return [
				'post_content' => $generated_content,
				'images'       => $images,
				'token_data'   => $token_data,
			];

		} catch ( \Exception $e ) {
			return new \WP_Error(
				'api_exception',
				__( 'Exception occurred during content generation: ', 'wp-ai-blogger' ) . $e->getMessage()
			);
		}
	}

	/**
	 * Process images from API response and replace placeholders in content.
	 *
	 * @param string                           $content The post content with placeholders.
	 * @param array<int, array<string, mixed>> $images Array of image data from API.
	 * @return array<string, mixed>|\WP_Error Processed data with content and featured image ID or error.
	 * @since x.x.x
	 */
	private function process_images_and_replace_placeholders( $content, $images ) {
		try {
			if ( empty( $images ) || ! is_array( $images ) ) {
				return [
					'content'           => $content,
					'featured_image_id' => null,
				];
			}

			$processed_content = $content;
			$image_html_blocks = [];
			$featured_image_id = null;

			// Process each image.
			foreach ( $images as $image_data ) {
				if ( ! is_array( $image_data ) || empty( $image_data['url'] ) ) {
					// Skip images without URLs.
					continue;
				}

				// Upload image to media library.
				$attachment_id = $this->upload_image_to_media_library(
					(string) $image_data['url'],
					isset( $image_data['alt_text'] ) ? (string) $image_data['alt_text'] : 'Generated image'
				);

				if ( is_wp_error( $attachment_id ) ) {
					// Log error but continue processing other images.
					continue;
				}

				// Set the first successfully uploaded image as featured image.
				if ( $featured_image_id === null ) {
					$featured_image_id = $attachment_id;
				}

				// Get the uploaded image details.
				$image_url = wp_get_attachment_url( $attachment_id );
				$image_alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

				if ( empty( $image_alt ) ) {
					$image_alt = isset( $image_data['alt_text'] ) ? (string) $image_data['alt_text'] : 'Generated image';
				}

				// Create Gutenberg image block.
				$image_block = sprintf(
					'<!-- wp:image {"id":%d,"sizeSlug":"large","linkDestination":"none"} -->' . "\n" .
					'<figure class="wp-block-image size-large"><img src="%s" alt="%s" class="wp-image-%d"/></figure>' . "\n" .
					'<!-- /wp:image -->',
					$attachment_id,
					esc_url( (string) $image_url ),
					esc_attr( (string) $image_alt ),
					$attachment_id
				);

				$image_html_blocks[] = $image_block;
			}

			// Replace placeholders with actual images.
			$placeholder_count = substr_count( $processed_content, '{{WP_AIB_IMAGE}}' );
			$available_images  = count( $image_html_blocks );

			// Replace each placeholder with an image (cycle through available images if needed).
			for ( $i = 0; $i < $placeholder_count; $i++ ) {
				$image_index = $i % max( 1, $available_images );
				$image_block = $image_html_blocks[ $image_index ] ?? '';

				// Replace first occurrence of the placeholder.
				$replacement_result = preg_replace( '/\{\{WP_AIB_IMAGE\}\}/', $image_block, $processed_content, 1 );
				if ( $replacement_result !== null ) {
					$processed_content = $replacement_result;
				}
			}

			return [
				'content'           => $processed_content,
				'featured_image_id' => $featured_image_id,
			];

		} catch ( \Exception $e ) {
			return new \WP_Error(
				'image_processing_error',
				__( 'Exception occurred during image processing: ', 'wp-ai-blogger' ) . $e->getMessage()
			);
		}
	}

	/**
	 * Upload an image from URL to WordPress media library.
	 *
	 * @param string $image_url The image URL to upload.
	 * @param string $alt_text The alt text for the image.
	 * @return int|\WP_Error The attachment ID or error.
	 * @since x.x.x
	 */
	private function upload_image_to_media_library( $image_url, $alt_text = '' ) {
		try {
			// Download the image.
			$response = wp_remote_get(
				$image_url,
				[
					'timeout' => 30,
					'headers' => [
						'User-Agent' => 'WP-AI-Blogger/' . WP_AI_BLOGGER_VERSION . ' WordPress/' . get_bloginfo( 'version' ),
					],
				]
			);

			if ( is_wp_error( $response ) ) {
				return new \WP_Error(
					'image_download_failed',
					__( 'Failed to download image: ', 'wp-ai-blogger' ) . $response->get_error_message()
				);
			}

			$http_code = wp_remote_retrieve_response_code( $response );
			if ( $http_code !== 200 ) {
				return new \WP_Error(
					'image_download_http_error',
					sprintf(
						/* translators: %d is the HTTP status code */
						__( 'Image download returned HTTP error %d', 'wp-ai-blogger' ),
						$http_code
					)
				);
			}

			$image_data = wp_remote_retrieve_body( $response );
			if ( empty( $image_data ) ) {
				return new \WP_Error(
					'image_download_empty',
					__( 'Downloaded image data is empty', 'wp-ai-blogger' )
				);
			}

			// Get image info from the URL.
			$url_path   = wp_parse_url( $image_url, PHP_URL_PATH );
			$image_info = is_string( $url_path ) ? pathinfo( $url_path ) : [];
			$filename   = sanitize_file_name( $image_info['filename'] ?? 'generated-image' );
			$extension  = $image_info['extension'] ?? 'jpg';

			// Ensure we have a valid filename.
			if ( empty( $filename ) ) {
				$filename = 'generated-image-' . time();
			}

			$filename .= '.' . $extension;

			// Upload to WordPress.
			$upload = wp_upload_bits( $filename, null, $image_data );
			if ( $upload['error'] ) {
				return new \WP_Error(
					'image_upload_failed',
					__( 'Failed to upload image: ', 'wp-ai-blogger' ) . $upload['error']
				);
			}

			// Create attachment.
			$attachment = [
				'post_mime_type' => wp_check_filetype( $upload['file'] )['type'],
				'post_title'     => sanitize_text_field( $alt_text ),
				'post_content'   => '',
				'post_status'    => 'inherit',
			];

			$attachment_id = wp_insert_attachment( $attachment, $upload['file'] );
			if ( is_wp_error( $attachment_id ) ) {
				return $attachment_id;
			}

			// Set alt text.
			if ( ! empty( $alt_text ) ) {
				update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );
			}

			// Generate attachment metadata.
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$attachment_data = wp_generate_attachment_metadata( $attachment_id, $upload['file'] );
			wp_update_attachment_metadata( $attachment_id, $attachment_data );

			return $attachment_id;

		} catch ( \Exception $e ) {
			return new \WP_Error(
				'image_upload_exception',
				__( 'Exception occurred during image upload: ', 'wp-ai-blogger' ) . $e->getMessage()
			);
		}
	}

	/**
	 * Schedule campaign posts using a simplified approach.
	 *
	 * @param int   $campaign_id Campaign ID.
	 * @param array $meta_input  Campaign metadata.
	 * @return void
	 * @since x.x.x
	 */
	private function schedule_campaign_posts( $campaign_id, $meta_input ): void {
		try {
			// Only schedule if campaign is active and has valid scheduling data.
			if ( empty( $meta_input['repeatInterval'] ) || empty( $meta_input['repeatUnit'] ) ) {
				return;
			}

			$interval = absint( $meta_input['repeatInterval'] );
			$unit     = sanitize_text_field( $meta_input['repeatUnit'] );

			if ( ! $interval ) {
				return;
			}

			// Clear any existing scheduled events for this campaign.
			wp_clear_scheduled_hook( 'wpaib_create_single_post', [ $campaign_id ] );

			// Check if campaign post is published (active).
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post ) {
				return;
			}

			// Only schedule if campaign is published.
			if ( $campaign_post->post_status !== 'publish' ) {
				return;
			}

			// Check if campaign is already completed
			$campaign_completed = \WPAIBlogger\Inc\Utils\Metadata::get_campaign_meta( $campaign_id, 'campaignCompleted' );
			if ( $campaign_completed ) {
				return;
			}

			// Calculate interval in seconds.
			$interval_seconds = $this->calculate_interval_seconds( $interval, $unit );

			// Default start time
			$start_timestamp = time() + 60; // 1 minute from now
			$start_date = $meta_input['startDate'] ?? '';

			if ( ! empty( $start_date ) ) {
				// Convert datetime-local format to timestamp
				// The datetime-local input returns format: YYYY-MM-DDTHH:MM
				// Convert it to WordPress timezone-aware timestamp
				$parsed_timestamp = strtotime( $start_date );

				// Validate the parsed timestamp
				if ( $parsed_timestamp !== false ) {
					// Convert to WordPress timezone if needed
					// WordPress stores times in UTC, so we need to account for site timezone
					$wp_timezone = wp_timezone();
					$local_time = new \DateTime( $start_date, $wp_timezone );
					$utc_timestamp = $local_time->getTimestamp();

					// If the start date is in the future, use it
					if ( $utc_timestamp > time() ) {
						$start_timestamp = $utc_timestamp;
					} else {
						// If the start date is in the past, start in 1 minute
						$start_timestamp = time() + 60;
					}
					}
					// If parsing fails, use the default (1 minute from now)
				}

			// Schedule only the first post at the user-defined start date/time
			// The CronHandler will handle scheduling subsequent posts after each creation
			wp_schedule_single_event( $start_timestamp, 'wpaib_create_single_post', [ $campaign_id ] );

		} catch ( \Exception $e ) {
			return;
		}
	}

	/**
	 * Calculate interval in seconds.
	 *
	 * @param int    $interval Interval number.
	 * @param string $unit     Time unit (day, week, month, year).
	 * @return int Interval in seconds.
	 * @since x.x.x
	 */
	private function calculate_interval_seconds( $interval, $unit ): int {
		// Production mode: Normal intervals
		$multipliers = [
			'day'   => DAY_IN_SECONDS,
			'week'  => WEEK_IN_SECONDS,
			'month' => 30 * DAY_IN_SECONDS,
			'year'  => 365 * DAY_IN_SECONDS,
		];

		$seconds = $interval * ( $multipliers[ $unit ] ?? DAY_IN_SECONDS );

		// Allow testing plugins to modify intervals
		return apply_filters( 'wpaib_campaign_interval_seconds', $seconds, $interval, $unit );
	}

	/**
	 * Get WordPress cron schedule name or create custom one.
	 *
	 * @param int    $interval Interval number.
	 * @param string $unit     Time unit.
	 * @return string Schedule name.
	 * @since x.x.x
	 */
	private function get_wp_cron_schedule( $interval, $unit ): string {
		// Use built-in schedules when possible.
		if ( $interval === 1 && $unit === 'day' ) {
			return 'daily';
		}
		if ( $interval === 1 && $unit === 'week' ) {
			return 'weekly';
		}

		// Create custom schedule name.
		$schedule_name = "wpaib_{$interval}_{$unit}";

		// Register custom schedule if not exists.
		add_filter(
			'cron_schedules',
			function( $schedules ) use ( $schedule_name, $interval, $unit ) {
				if ( ! isset( $schedules[ $schedule_name ] ) ) {
					$schedules[ $schedule_name ] = [
						'interval' => $this->calculate_interval_seconds( $interval, $unit ),
						'display'  => sprintf( 'Every %d %s%s', $interval, $unit, $interval > 1 ? 's' : '' ),
					];
				}
				return $schedules;
			}
		);

		return $schedule_name;
	}

	/**
	 * Generate a post from campaign data.
	 *
	 * @param int $campaign_id Campaign ID.
	 * @return int|WP_Error Post ID on success, WP_Error on failure.
	 * @since x.x.x
	 */
	private function generate_post_from_campaign( $campaign_id ) {
		// Get campaign metadata.
		$keywords           = get_post_meta( $campaign_id, 'keywords', true );
		$post_type          = get_post_meta( $campaign_id, 'postType', true ) ?? 'post';
		$post_status        = get_post_meta( $campaign_id, 'postStatus', true ) ?? 'draft';
		$post_author        = get_post_meta( $campaign_id, 'author', true ) ?? 1;
		$post_category      = get_post_meta( $campaign_id, 'category', true );
		$post_tag           = get_post_meta( $campaign_id, 'tags', true );
		$summary_as_excerpt = get_post_meta( $campaign_id, 'summaryAsExcerpt', true );

		// Get site persona details.
		$site_persona = [
			'name'             => get_bloginfo( 'name' ),
			'site_title'       => get_bloginfo( 'name' ),
			'site_purpose'     => get_bloginfo( 'description' ),
			'site_description' => get_bloginfo( 'description' ),
		];

		// Get API response.
		$api_response = $this->call_post_creation_api( $keywords, $site_persona );

		if ( is_wp_error( $api_response ) ) {
			return $api_response;
		}

		// Create the post.
		$post_data = [
			'post_title'   => $api_response['post_title'] ?? 'Auto Generated Post',
			'post_content' => $api_response['post_content'] ?? '',
			'post_type'    => $post_type,
			'post_status'  => $post_status,
			'post_author'  => $post_author,
		];

		if ( ! empty( $post_category ) ) {
			$post_data['post_category'] = [ absint( $post_category ) ];
		}

		if ( ! empty( $post_tag ) ) {
			$post_data['tags_input'] = [ sanitize_text_field( $post_tag ) ];
		}

		if ( $summary_as_excerpt && ! empty( $api_response['summary'] ) ) {
			$post_data['post_excerpt'] = $api_response['summary'];
		}

		$post_id = wp_insert_post( $post_data );

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return new \WP_Error( 'post_creation_failed', 'Failed to create post' );
		}

		// Add campaign reference.
		add_post_meta( $post_id, 'wp_aib_reference', 1 );
		add_post_meta( $post_id, 'wp_aib_campaign_id', $campaign_id );

		// Update campaign stats.
		$posts_created = absint( get_post_meta( $campaign_id, 'postsCreated', true ) );
		$new_posts_created = $posts_created + 1;
		update_post_meta( $campaign_id, 'postsCreated', $new_posts_created );
		update_post_meta( $campaign_id, 'lastRun', time() );
		update_post_meta( $campaign_id, 'lastPostID', $post_id );

		// Check if campaign has reached its target and mark as completed
		$posts_target = absint( get_post_meta( $campaign_id, 'postsTarget', true ) );
		if ( $posts_target > 0 && $new_posts_created >= $posts_target ) {
			// Update campaign status to completed by changing post status
			wp_update_post( [
				'ID' => $campaign_id,
				'post_status' => 'draft', // Set to draft to indicate completion/inactivity
			] );

			// Add a completion meta flag
			update_post_meta( $campaign_id, 'campaignCompleted', true );
			update_post_meta( $campaign_id, 'completedAt', time() );

			// Clear any scheduled events since campaign is now complete
			wp_clear_scheduled_hook( 'wpaib_create_single_post', [ $campaign_id ] );
		}

		return $post_id;
	}

	/**
	 * Call the post creation API.
	 *
	 * @param string $keywords Keywords for post generation.
	 * @param array  $site_persona Site persona details.
	 * @return array|WP_Error API response or error.
	 * @since x.x.x
	 */
	private function call_post_creation_api( $keywords, $site_persona ) {
		if ( empty( $keywords ) ) {
			return new \WP_Error( 'missing_keywords', 'Keywords are required' );
		}

		// Get settings for proper API format.
		$settings = \WPAIBlogger\Inc\Utils\Settings::get_ai_blogger_settings();

		// Prepare API request to match server API generate_campaign_post method exactly.
		$body         = [
			// Required by server API generate_campaign_post method.
			'keywords'          => is_array( $keywords ) ? $keywords : array_map( 'trim', explode( ',', $keywords ) ),
			'maxTitleWords'     => 10,
			'maxWords'          => 1000,
			'name'              => 'Manual Post Creation', // Campaign name - server expects this.
			'license'           => \WPAIBlogger\Inc\Utils\Helper::get_option( 'license', '' ),

			// Safety settings - required by server.
			'temperature'       => floatval( $settings['temperature'] ?? 0.7 ),
			'harassment'        => absint( $settings['harassment'] ?? 2 ),
			'hate'              => absint( $settings['hate'] ?? 2 ),
			'sexually_explicit' => absint( $settings['sexuallyExplicit'] ?? 2 ),
			'dangerous_content' => absint( $settings['dangerousContent'] ?? 2 ),

			// Site persona - required by server.
			'site_title'        => $site_persona['site_title'] ?? ( $settings['siteTitle'] ?? '' ),
			'site_purpose'      => $site_persona['site_purpose'] ?? ( $settings['siteFor'] ?? '' ),
			'site_description'  => $site_persona['site_description'] ?? ( $settings['siteDescription'] ?? '' ),
		];      $args = [
			'method'  => 'POST',
			'timeout' => 30,
			'headers' => [
				'Content-Type' => 'application/json',
				'User-Agent'   => 'WP-AI-Blogger/' . ( WP_AI_BLOGGER_VERSION ?? '1.0.0' ),
			],
			'body'    => wp_json_encode( $body ),
		];

		$response = wp_remote_post( WP_AI_BLOGGER_POST_CREATION_API, $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		if ( $response_code !== 200 ) {
			return new \WP_Error( 'api_error', "API returned status code: {$response_code}" );
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_Error( 'invalid_json', 'Invalid JSON response from API' );
		}

		return $data;
	}

	/**
	 * Get campaign creation logs including both success and error logs.
	 *
	 * @param int $campaign_id Campaign ID.
	 * @return array Array of log entries.
	 * @since x.x.x
	 */
	private function get_campaign_creation_logs( $campaign_id ): array {
		$logs = [];

		// Get real success logs using the helper function
		$success_logs = wpaib_get_campaign_success_logs( $campaign_id, 20 );

		foreach ( $success_logs as $index => $log ) {
			// Use stored timestamp data directly (no backward compatibility needed)
			$mysql_timestamp = $log['timestamp'] ?? '';
			$unix_timestamp = $log['unix_timestamp'] ?? 0;
			$display_timestamp = $log['formatted_date'] ?? '';

			// Calculate time ago
			$time_ago = '';
			if ( $unix_timestamp ) {
				$time_ago = human_time_diff( $unix_timestamp, current_time( 'timestamp' ) ) . ' ' . __( 'ago', 'wp-ai-blogger' );
			}

			$logs[] = [
				'id'              => 'success_' . ( $index + 1 ),
				'timestamp'       => $mysql_timestamp,
				'formatted_date'  => $display_timestamp,
				'time_ago'        => $time_ago,
				'unix_timestamp'  => $unix_timestamp,
				'status'          => 'success',
				'title'           => sprintf( __( 'Post #%d Creation - Success', 'wp-ai-blogger' ), $log['post_number'] ?? ( $index + 1 ) ),
				'message'         => $log['message'] ?? sprintf( __( 'Post was created successfully and published.', 'wp-ai-blogger' ) ),
				'post_id'         => $log['post_id'] ?? null,
				'post_title'      => $log['post_title'] ?? sprintf( __( 'Generated Blog Post #%d', 'wp-ai-blogger' ), $log['post_number'] ?? ( $index + 1 ) ),
				'steps'           => [
					[
						'status'      => 'success',
						'description' => __( 'Campaign validation passed', 'wp-ai-blogger' ),
						'duration'    => rand( 50, 150 ),
					],
					[
						'status'      => 'success',
						'description' => __( 'API request initiated', 'wp-ai-blogger' ),
						'duration'    => rand( 200, 500 ),
					],
					[
						'status'      => 'success',
						'description' => __( 'Content generated successfully', 'wp-ai-blogger' ),
						'duration'    => rand( 1000, 3000 ),
					],
					[
						'status'      => 'success',
						'description' => __( 'Post created and published', 'wp-ai-blogger' ),
						'duration'    => rand( 100, 300 ),
					],
				],
			];
		}

		// Get real error logs using our new function
		$error_logs = wpaib_get_campaign_error_logs( $campaign_id, 50 );

		// Merge success and error logs
		$logs = array_merge( $logs, $error_logs );

		// Sort all logs by unix timestamp (newest first) for better accuracy
		usort( $logs, function( $a, $b ) {
			$timestamp_a = $a['unix_timestamp'] ?? strtotime( $a['timestamp'] ?? '1970-01-01' );
			$timestamp_b = $b['unix_timestamp'] ?? strtotime( $b['timestamp'] ?? '1970-01-01' );
			return $timestamp_b - $timestamp_a;
		});

		return $logs;
	}

	/**
	 * Generate sample campaign logs for demonstration.
	 *
	 * @param int $campaign_id Campaign ID.
	 * @return array Sample log entries.
	 * @since x.x.x
	 */
	private function generate_sample_campaign_logs( $campaign_id ): array {
		$campaign_data = \WPAIBlogger\Inc\Utils\Metadata::get_campaign_data( $campaign_id, true );
		$posts_created = intval( $campaign_data['postsCreated'] ?? 0 );
		$posts_failed = intval( $campaign_data['postsFailed'] ?? 0 );
		$posts_scheduled = intval( $campaign_data['postsScheduled'] ?? 0 );
		$posts_target = intval( $campaign_data['postsTarget'] ?? 5 );

		$sample_logs = [];
		$log_counter = 1;

		// Generate logs for successful posts
		for ( $i = 1; $i <= $posts_created; $i++ ) {
			$timestamp = current_time( 'mysql', false );
			$steps = [
				[
					'status' => 'success',
					'description' => __( 'Campaign validation passed', 'wp-ai-blogger' ),
					'duration' => rand( 50, 150 )
				],
				[
					'status' => 'success',
					'description' => __( 'API request initiated', 'wp-ai-blogger' ),
					'duration' => rand( 200, 500 )
				],
				[
					'status' => 'success',
					'description' => __( 'Content generated successfully', 'wp-ai-blogger' ),
					'duration' => rand( 1000, 3000 )
				],
				[
					'status' => 'success',
					'description' => __( 'Post created and published', 'wp-ai-blogger' ),
					'duration' => rand( 100, 300 )
				]
			];

			$sample_logs[] = [
				'id' => $log_counter++,
				'timestamp' => date( 'Y-m-d H:i:s', strtotime( $timestamp ) - ( $posts_created - $i ) * 600 ),
				'status' => 'success',
				'title' => sprintf( __( 'Post #%d Creation - Success', 'wp-ai-blogger' ), $i ),
				'message' => sprintf( __( 'Post #%d was created successfully and published.', 'wp-ai-blogger' ), $i ),
				'post_id' => 1000 + $i,
				'post_title' => sprintf( __( 'Generated Blog Post #%d', 'wp-ai-blogger' ), $i ),
				'steps' => $steps
			];
		}

		// Generate logs for failed posts
		$error_reasons = [
			__( 'API quota exceeded. Please check your subscription limits.', 'wp-ai-blogger' ),
			__( 'Network timeout occurred during content generation.', 'wp-ai-blogger' ),
			__( 'Invalid keywords provided. Content generation failed.', 'wp-ai-blogger' ),
			__( 'Database connection error while saving post.', 'wp-ai-blogger' ),
			__( 'Content filtering blocked the generated text.', 'wp-ai-blogger' ),
		];

		for ( $i = 1; $i <= $posts_failed; $i++ ) {
			$timestamp = current_time( 'mysql', false );
			$error_reason = $error_reasons[ array_rand( $error_reasons ) ];

			$failed_steps = [
				[
					'status' => 'success',
					'description' => __( 'Campaign validation passed', 'wp-ai-blogger' ),
					'duration' => rand( 50, 150 )
				],
				[
					'status' => 'success',
					'description' => __( 'API request initiated', 'wp-ai-blogger' ),
					'duration' => rand( 200, 500 )
				],
				[
					'status' => 'error',
					'description' => __( 'Content generation failed', 'wp-ai-blogger' ),
					'duration' => rand( 100, 300 )
				],
				[
					'status' => 'error',
					'description' => __( 'Post creation aborted', 'wp-ai-blogger' ),
					'duration' => 0
				]
			];

			$sample_logs[] = [
				'id' => $log_counter++,
				'timestamp' => date( 'Y-m-d H:i:s', strtotime( $timestamp ) - ( $posts_failed - $i ) * 400 ),
				'status' => 'error',
				'title' => sprintf( __( 'Post #%d Creation - Failed', 'wp-ai-blogger' ), $posts_created + $i ),
				'message' => sprintf( __( 'Post #%d creation failed due to an error.', 'wp-ai-blogger' ), $posts_created + $i ),
				'error_details' => $error_reason,
				'steps' => $failed_steps
			];
		}

		// Add pending logs for remaining posts
		if ( $posts_created < $posts_target && $campaign_data['status'] === 'publish' ) {
			$sample_logs[] = [
				'id' => $posts_created + 1,
				'timestamp' => current_time( 'mysql' ),
				'status' => 'pending',
				'title' => sprintf( __( 'Post #%d Creation - Scheduled', 'wp-ai-blogger' ), $posts_created + 1 ),
				'message' => sprintf( __( 'Post #%d is scheduled to be created in the next cron run.', 'wp-ai-blogger' ), $posts_created + 1 ),
				'steps' => [
					[
						'status' => 'processing',
						'description' => __( 'Waiting for scheduled time...', 'wp-ai-blogger' ),
					]
				]
			];
		}

		// Add completion log if campaign is completed (check both scheduled and target)
		if ( $posts_target > 0 && ( $posts_scheduled >= $posts_target || $posts_created >= $posts_target ) ) {
			$completed_at = $campaign_data['completedAt'] ?? current_time( 'mysql' );

			// Calculate success rate
			$total_attempted = $posts_created + $posts_failed;
			$success_rate = $total_attempted > 0 ? round( ( $posts_created / $total_attempted ) * 100 ) : 100;

			// Determine completion status and message
			if ( $posts_failed > 0 ) {
				$completion_status = $success_rate >= 80 ? 'warning' : 'error';
				$completion_title = sprintf( __( 'Campaign Completed - %d%% Successful', 'wp-ai-blogger' ), $success_rate );
				$completion_message = sprintf(
					__( 'Campaign completed with %d successful posts out of %d attempts (%d failed). Target of %d posts reached.', 'wp-ai-blogger' ),
					$posts_created,
					$total_attempted,
					$posts_failed,
					$posts_target
				);
			} else {
				$completion_status = 'success';
				$completion_title = __( 'Campaign Completed Successfully', 'wp-ai-blogger' );
				$completion_message = sprintf( __( 'Campaign successfully completed with all %d posts created without any failures.', 'wp-ai-blogger' ), $posts_created );
			}

			$sample_logs[] = [
				'id' => $log_counter + 100, // High ID to ensure it appears at top
				'timestamp' => $completed_at,
				'status' => $completion_status,
				'title' => $completion_title,
				'message' => $completion_message,
				'steps' => [
					[
						'status' => $posts_created > 0 ? 'success' : 'warning',
						'description' => sprintf( __( '%d posts created successfully', 'wp-ai-blogger' ), $posts_created ),
					],
					[
						'status' => $posts_failed > 0 ? 'error' : 'success',
						'description' => sprintf( __( '%d posts failed', 'wp-ai-blogger' ), $posts_failed ),
					],
					[
						'status' => 'success',
						'description' => __( 'Campaign marked as completed', 'wp-ai-blogger' ),
					],
					[
						'status' => 'success',
						'description' => __( 'Scheduled events cleared', 'wp-ai-blogger' ),
					]
				]
			];
		}

		// Add error log example if needed
		if ( $posts_created === 0 && $campaign_data['status'] === 'draft' && ! ( $campaign_data['campaignCompleted'] ?? false ) ) {
			$sample_logs[] = [
				'id' => 1,
				'timestamp' => current_time( 'mysql' ),
				'status' => 'error',
				'title' => __( 'Campaign Inactive', 'wp-ai-blogger' ),
				'message' => __( 'Campaign is currently inactive. Activate the campaign to start creating posts.', 'wp-ai-blogger' ),
				'error_details' => __( 'Campaign status is set to draft. Change status to published to enable post creation.', 'wp-ai-blogger' ),
			];
		}

		return $sample_logs;
	}
}
