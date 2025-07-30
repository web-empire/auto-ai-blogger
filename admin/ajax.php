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
 * This class handles AJAX requests for admin operations including
 * settings management, campaign operations, and post creation.
 * Implements security measures including rate limiting,
 * input validation, and proper authentication.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 */
class Ajax {
	use Get_Instance;

	/**
	 * Maximum AJAX requests per user per hour.
	 *
	 * @var int
	 */
	private const RATE_LIMIT_MAX_REQUESTS = 200;

	/**
	 * Rate limiting time window in seconds (1 hour).
	 *
	 * @var int
	 */
	private const RATE_LIMIT_WINDOW = 3600;

	/**
	 * Maximum request size in bytes (2MB for AJAX operations).
	 *
	 * @var int
	 */
	private const MAX_REQUEST_SIZE = 2097152;

	/**
	 * Maximum campaign content length.
	 *
	 * @var int
	 */
	private const MAX_CAMPAIGN_CONTENT_LENGTH = 50000;

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
			'permission'           => __( 'Sorry, you are not allowed to do this operation.', 'wp-ai-blogger' ),
			'nonce'               => __( 'Nonce validation failed', 'wp-ai-blogger' ),
			'default'             => __( 'Sorry, something went wrong.', 'wp-ai-blogger' ),
			'success'             => __( 'Successfully saved data!', 'wp-ai-blogger' ),
			'rate_limit'          => __( 'Too many requests. Please try again later.', 'wp-ai-blogger' ),
			'request_too_large'   => __( 'Request size exceeds maximum allowed limit.', 'wp-ai-blogger' ),
			'invalid_data'        => __( 'Invalid or malformed data provided.', 'wp-ai-blogger' ),
			'security_violation'  => __( 'Security check failed. Request blocked.', 'wp-ai-blogger' ),
			'content_too_long'    => __( 'Content exceeds maximum allowed length.', 'wp-ai-blogger' ),
		];

		/* Initialize AJAX events */
		foreach ( $this->ajax_events as $action ) {
			add_action( 'wp_ajax_' . $action, [ $this, $action ] );
		}

		// Add security headers for AJAX responses
		add_action( 'wp_ajax_wpaib_update_admin_setting', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_create_campaign', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_update_campaign', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_get_campaign_metadata', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_create_post', [ $this, 'add_security_headers' ], 1 );
		add_action( 'wp_ajax_wpaib_run_campaign', [ $this, 'add_security_headers' ], 1 );
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
	 * @since 2.0.0
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
	 * Perform comprehensive security validation for AJAX requests.
	 *
	 * @param string $action The AJAX action being performed.
	 * @return bool|\WP_Error True if valid, WP_Error if security check fails.
	 * @since 2.0.0
	 */
	private function validate_ajax_security( $action = '' ) {
		try {
			// Check user capabilities
			if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
				return new \WP_Error( 'permission_denied', $this->get_error_msg( 'permission' ) );
			}

			// Rate limiting check
			$rate_limit_check = $this->check_ajax_rate_limit();
			if ( is_wp_error( $rate_limit_check ) ) {
				return $rate_limit_check;
			}

			// Validate request size
			$request_size_check = $this->validate_ajax_request_size();
			if ( is_wp_error( $request_size_check ) ) {
				return $request_size_check;
			}

			// Check for suspicious User-Agent
			$user_agent_check = $this->validate_user_agent();
			if ( is_wp_error( $user_agent_check ) ) {
				return $user_agent_check;
			}

			// Validate referer for admin requests
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
	 * Check rate limiting for AJAX requests.
	 *
	 * @return bool|\WP_Error True if allowed, WP_Error if rate limited.
	 * @since 2.0.0
	 */
	private function check_ajax_rate_limit() {
		$user_id = get_current_user_id();
		$client_ip = $this->get_client_ip();

		// Create unique key for rate limiting (prefer user ID over IP)
		$rate_key = $user_id > 0 ? 'user_' . $user_id : 'ip_' . $client_ip;
		$cache_key = 'wp_ai_blogger_ajax_rate_limit_' . md5( $rate_key );

		// Get cached data
		$cached_data = get_transient( $cache_key );

		if ( false === $cached_data ) {
			// First request - set counter
			set_transient( $cache_key, [ 'count' => 1, 'start_time' => time() ], self::RATE_LIMIT_WINDOW );
			return true;
		}

		// Check if limit exceeded
		if ( $cached_data['count'] >= self::RATE_LIMIT_MAX_REQUESTS ) {
			return new \WP_Error( 'rate_limit_exceeded', $this->get_error_msg( 'rate_limit' ) );
		}

		// Increment counter
		$cached_data['count']++;
		set_transient( $cache_key, $cached_data, self::RATE_LIMIT_WINDOW );

		return true;
	}

	/**
	 * Validate AJAX request size.
	 *
	 * @return bool|\WP_Error True if valid, WP_Error if too large.
	 * @since 2.0.0
	 */
	private function validate_ajax_request_size() {
		$content_length = $_SERVER['CONTENT_LENGTH'] ?? 0;

		if ( (int) $content_length > self::MAX_REQUEST_SIZE ) {
			return new \WP_Error( 'request_too_large', $this->get_error_msg( 'request_too_large' ) );
		}

		return true;
	}

	/**
	 * Get the client's IP address.
	 *
	 * @return string The client's IP address.
	 * @since 2.0.0
	 */
	private function get_client_ip() {
		$ip_headers = [
			'HTTP_CF_CONNECTING_IP',     // Cloudflare
			'HTTP_X_FORWARDED_FOR',      // Load balancers/proxies
			'HTTP_X_FORWARDED',          // Proxies
			'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster environments
			'HTTP_FORWARDED_FOR',        // Proxies
			'HTTP_FORWARDED',            // Proxies
			'REMOTE_ADDR'                // Standard
		];

		foreach ( $ip_headers as $header ) {
			if ( ! empty( $_SERVER[ $header ] ) ) {
				$ips = explode( ',', $_SERVER[ $header ] );
				$ip  = trim( $ips[0] );
				if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
					return $ip;
				}
			}
		}

		return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
	}

	/**
	 * Validate User-Agent header.
	 *
	 * @return bool|\WP_Error True if valid, WP_Error if suspicious.
	 * @since 2.0.0
	 */
	private function validate_user_agent() {
		$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

		if ( empty( $user_agent ) ) {
			return new \WP_Error( 'invalid_user_agent', $this->get_error_msg( 'security_violation' ) );
		}

		$suspicious_patterns = [
			'bot', 'crawler', 'spider', 'scraper', 'curl/7.', 'wget',
			'python-requests', 'libwww-perl', 'java/', 'go-http-client'
		];

		$user_agent_lower = strtolower( $user_agent );

		foreach ( $suspicious_patterns as $pattern ) {
			if ( strpos( $user_agent_lower, $pattern ) !== false ) {
				// Allow legitimate WordPress and plugin requests
				if ( strpos( $user_agent_lower, 'wordpress' ) === false &&
				     strpos( $user_agent_lower, 'wp-ai-blogger' ) === false ) {
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
	 * @since 2.0.0
	 */
	private function validate_admin_referer() {
		$referer = $_SERVER['HTTP_REFERER'] ?? '';

		if ( ! empty( $referer ) ) {
			$admin_url = admin_url();
			$site_url = get_site_url();

			if ( strpos( $referer, $admin_url ) !== 0 && strpos( $referer, $site_url ) !== 0 ) {
				return new \WP_Error( 'invalid_referer', $this->get_error_msg( 'security_violation' ) );
			}
		}

		return true;
	}

	/**
	 * Sanitize and validate campaign data.
	 *
	 * @param array $campaign_data Raw campaign data.
	 * @return array|\WP_Error Sanitized data or error.
	 * @since 2.0.0
	 */
	private function sanitize_campaign_data( $campaign_data ) {
		if ( ! is_array( $campaign_data ) ) {
			return new \WP_Error( 'invalid_data_type', $this->get_error_msg( 'invalid_data' ) );
		}

		$allowed_keys = [
			'id', 'title', 'content', 'status', 'frequency', 'keywords',
			'category', 'tags', 'meta_input', 'post_count', 'schedule'
		];

		$sanitized = [];

		foreach ( $campaign_data as $key => $value ) {
			// Only allow whitelisted keys
			if ( ! in_array( $key, $allowed_keys, true ) ) {
				continue;
			}

			// Sanitize based on key type
			switch ( $key ) {
				case 'id':
				case 'post_count':
					$sanitized[ $key ] = absint( $value );
					break;
				case 'title':
					$sanitized[ $key ] = sanitize_text_field( $value );
					if ( strlen( $sanitized[ $key ] ) > 200 ) {
						return new \WP_Error( 'title_too_long', __( 'Campaign title is too long.', 'wp-ai-blogger' ) );
					}
					break;
				case 'content':
					$sanitized[ $key ] = wp_kses_post( $value );
					if ( strlen( $sanitized[ $key ] ) > self::MAX_CAMPAIGN_CONTENT_LENGTH ) {
						return new \WP_Error( 'content_too_long', $this->get_error_msg( 'content_too_long' ) );
					}
					break;
				case 'status':
					$allowed_statuses = [ 'draft', 'publish', 'private', 'pending' ];
					$sanitized[ $key ] = in_array( $value, $allowed_statuses, true ) ? $value : 'draft';
					break;
				case 'keywords':
				case 'tags':
					if ( is_array( $value ) ) {
						$sanitized[ $key ] = array_map( 'sanitize_text_field', $value );
					} else {
						$sanitized[ $key ] = sanitize_text_field( $value );
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
					$sanitized[ $key ] = sanitize_text_field( $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize meta input data.
	 *
	 * @param array $meta_data Raw meta data.
	 * @return array Sanitized meta data.
	 * @since 2.0.0
	 */
	private function sanitize_meta_input( $meta_data ) {
		$sanitized = [];
		$allowed_meta_keys = [
			'frequency', 'keywords', 'category', 'tags', 'post_count',
			'content_length', 'tone', 'language', 'include_images'
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
					$sanitized[ $key ] = sanitize_text_field( $value );
					break;
				case 'keywords':
				case 'tags':
					if ( is_array( $value ) ) {
						$sanitized[ $key ] = array_map( 'sanitize_text_field', $value );
					} else {
						$sanitized[ $key ] = sanitize_text_field( $value );
					}
					break;
				default:
					$sanitized[ $key ] = sanitize_text_field( $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Handler to update admin app settings with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_update_admin_setting(): void {
		try {
			// security validation
			$security_check = $this->validate_ajax_security( 'update_admin_setting' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate and sanitize input
			$sub_option_key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
			if ( empty( $sub_option_key ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Get allowed setting keys for validation
			$type_settings = Settings::get_all_type_wise_settings();
			$allowed_keys = array_keys( $type_settings );

			// Additional whitelist allowed setting keys
			if ( ! in_array( $sub_option_key, $allowed_keys, true ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			$sub_option_value = '';
			if ( ! empty( $_POST['value'] ) ) {
				if ( ! empty( $type_settings[ $sub_option_key ] ) ) {
					$sub_option_value = Settings::sanitize_data( $_POST['value'], $type_settings[ $sub_option_key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in Settings::sanitize_data.
				} else {
					$sub_option_value = Settings::sanitize_data( $_POST['value'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done in Settings::sanitize_data.
				}
			}

			// Update option with error handling
			$update_result = Helper::update_option( $sub_option_key, $sub_option_value );

			if ( false === $update_result ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
				return;
			}

			wp_send_json_success( [
				'message' => $this->get_error_msg( 'success' ),
				'key' => $sub_option_key,
				'updated' => true
			] );

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}
	}	/**
	 * Handler to create campaign with security.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function wpaib_create_campaign(): void {
		try {
			// security validation
			$security_check = $this->validate_ajax_security( 'create_campaign' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate and sanitize input
			$campaign_details = isset( $_POST['value'] ) ? wp_unslash( $_POST['value'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done below.

			if ( empty( $campaign_details ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Decode and validate JSON
			$campaign_details = json_decode( $campaign_details, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// data sanitization
			$sanitized_campaign = $this->sanitize_campaign_data( $campaign_details );
			if ( is_wp_error( $sanitized_campaign ) ) {
				wp_send_json_error( [ 'message' => $sanitized_campaign->get_error_message() ] );
				return;
			}

			// Legacy sanitization for backward compatibility
			$campaign_details = Metadata::sanitize_data( $campaign_details, 'array' );
			$formatted_campaign_data = Metadata::format_data( $campaign_details );

			// Validate required fields
			if ( empty( $formatted_campaign_data['title'] ) ) {
				wp_send_json_error( [ 'message' => __( 'Campaign title is required.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Create a new campaign with error handling
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
				wp_send_json_error( [
					'message' => $this->get_error_msg( 'default' ),
					'details' => is_wp_error( $campaign_id ) ? $campaign_id->get_error_message() : 'Failed to create campaign'
				] );
				return;
			}

			// Add schedule data in DB separately to manage effectively
			if ( ! empty( $formatted_campaign_data['meta_input']['frequency'] ) ) {
				$schedule_result = wpaib_update_schedules( $campaign_id, $formatted_campaign_data['meta_input']['frequency'] );
				if ( is_wp_error( $schedule_result ) ) {
					// Log error but don't fail the campaign creation
					}
			}

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
			// security validation
			$security_check = $this->validate_ajax_security( 'update_campaign' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate and sanitize input
			$campaign_details = isset( $_POST['value'] ) ? wp_unslash( $_POST['value'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done below.

			if ( empty( $campaign_details ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Decode and validate JSON
			$campaign_details = json_decode( $campaign_details, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Validate campaign ID
			$campaign_id = absint( $campaign_details['id'] ?? 0 );
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Check if campaign exists and user can edit it
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
				return;
			}

			if ( ! current_user_can( 'edit_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// data sanitization
			$sanitized_campaign = $this->sanitize_campaign_data( $campaign_details );
			if ( is_wp_error( $sanitized_campaign ) ) {
				wp_send_json_error( [ 'message' => $sanitized_campaign->get_error_message() ] );
				return;
			}

			// Legacy sanitization for backward compatibility
			$campaign_details = Metadata::sanitize_data( $campaign_details, 'array' );
			$formatted_campaign_data = Metadata::format_data( $campaign_details );

			// Validate required fields
			if ( empty( $formatted_campaign_data['title'] ) ) {
				wp_send_json_error( [ 'message' => __( 'Campaign title is required.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Update the campaign with error handling
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
				wp_send_json_error( [
					'message' => $this->get_error_msg( 'default' ),
					'details' => is_wp_error( $updated ) ? $updated->get_error_message() : 'Failed to update campaign'
				] );
				return;
			}

			// Add schedule data in DB separately to manage effectively
			if ( ! empty( $formatted_campaign_data['meta_input']['frequency'] ) ) {
				$schedule_result = wpaib_update_schedules( $campaign_id, $formatted_campaign_data['meta_input']['frequency'] );
				if ( is_wp_error( $schedule_result ) ) {
					// Log error but don't fail the campaign update
					}
			}

			wp_send_json_success( [
				'message' => $this->get_error_msg( 'success' ),
				'campaign_id' => $campaign_id,
				'title' => $formatted_campaign_data['title'],
				'updated' => true
			] );

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
			// security validation
			$security_check = $this->validate_ajax_security( 'get_campaign_metadata' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Validate campaign ID
			$campaign_id = absint( $_POST['campaign_id'] ?? 0 );
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Check if campaign exists and user can read it
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
				return;
			}

			if ( ! current_user_can( 'read_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Get campaign metadata with error handling
			$campaign_data = Metadata::get_campaign_data( $campaign_id, true );

			if ( empty( $campaign_data ) ) {
				wp_send_json_error( [ 'message' => __( 'Failed to retrieve campaign data.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Sanitize sensitive data before sending
			if ( isset( $campaign_data['api_key'] ) ) {
				$campaign_data['api_key'] = '***masked***';
			}
			if ( isset( $campaign_data['token'] ) ) {
				$campaign_data['token'] = '***masked***';
			}

			wp_send_json_success( [
				'data' => $campaign_data,
				'campaign_id' => $campaign_id,
				'message' => __( 'Campaign data retrieved successfully.', 'wp-ai-blogger' )
			] );

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
			// security validation
			$security_check = $this->validate_ajax_security( 'create_post' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Check if user can create posts
			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Validate and sanitize input
			$post_data = isset( $_POST['post_data'] ) ? wp_unslash( $_POST['post_data'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization is done below.

			if ( empty( $post_data ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			// Decode and validate JSON
			$post_data = json_decode( $post_data, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'invalid_data' ) ] );
				return;
			}

			if ( ! is_array( $post_data ) || empty( $post_data['title'] ) ) {
				wp_send_json_error( [ 'message' => __( 'Post title is required.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Sanitize post data
			$post_data = Metadata::sanitize_data( $post_data, 'array' );

			// Validate and sanitize title
			$post_title = sanitize_text_field( $post_data['title'] );
			if ( strlen( $post_title ) > 200 ) {
				wp_send_json_error( [ 'message' => __( 'Post title is too long (max 200 characters).', 'wp-ai-blogger' ) ] );
				return;
			}

			// Validate and sanitize content
			$post_content = wp_kses_post( $post_data['post_content'] ?? '' );
			if ( strlen( $post_content ) > 100000 ) { // 100KB limit
				wp_send_json_error( [ 'message' => __( 'Post content is too long.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Validate post status
			$allowed_statuses = [ 'draft', 'publish', 'private', 'pending' ];
			$post_status = isset( $post_data['status'] ) && in_array( $post_data['status'], $allowed_statuses, true )
				? $post_data['status']
				: 'draft';

			// Validate post type
			$post_type = sanitize_text_field( $post_data['post_type'] ?? 'post' );
			if ( ! post_type_exists( $post_type ) ) {
				$post_type = 'post';
			}

			// Check if user can create this post type
			$post_type_object = get_post_type_object( $post_type );
			if ( ! current_user_can( $post_type_object->cap->create_posts ) ) {
				wp_send_json_error( [ 'message' => __( 'You do not have permission to create this type of post.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Sanitize metadata
			$meta_data = [];
			if ( ! empty( $post_data['metadata'] ) ) {
				$metadata_raw = json_decode( $post_data['metadata'], true );
				if ( json_last_error() === JSON_ERROR_NONE && is_array( $metadata_raw ) ) {
					$meta_data = Metadata::sanitize_data( $metadata_raw, 'array' );
				}
			}

			// Create a new post with error handling
			$post_id = \wp_insert_post(
				[
					'post_title'   => $post_title,
					'post_content' => $post_content,
					'post_status'  => $post_status,
					'post_type'    => $post_type,
					'meta_input'   => $meta_data,
				]
			);

			if ( is_wp_error( $post_id ) || ! $post_id ) {
				wp_send_json_error( [
					'message' => $this->get_error_msg( 'default' ),
					'details' => is_wp_error( $post_id ) ? $post_id->get_error_message() : 'Failed to create post'
				] );
				return;
			}

			wp_send_json_success( [
				'message' => $this->get_error_msg( 'success' ),
				'post_id' => $post_id,
				'title' => $post_title,
				'status' => $post_status,
				'edit_link' => get_edit_post_link( $post_id, 'raw' ),
			] );

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
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
			// security validation
			$security_check = $this->validate_ajax_security( 'run_campaign' );
			if ( is_wp_error( $security_check ) ) {
				wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
				return;
			}

			// Nonce validation
			if ( ! check_ajax_referer( 'wpaib_admin_nonce', 'security', false ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
				return;
			}

			// Check if user can publish posts (required for running campaigns)
			if ( ! current_user_can( 'publish_posts' ) ) {
				wp_send_json_error( [ 'message' => __( 'You do not have permission to run campaigns.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Validate campaign ID
			$campaign_id = isset( $_POST['campaign_id'] ) ? absint( $_POST['campaign_id'] ) : 0;
			if ( ! $campaign_id ) {
				wp_send_json_error( [ 'message' => __( 'Invalid campaign ID.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Check if campaign exists and user can edit it
			$campaign_post = get_post( $campaign_id );
			if ( ! $campaign_post || $campaign_post->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
				wp_send_json_error( [ 'message' => __( 'Campaign not found.', 'wp-ai-blogger' ) ] );
				return;
			}

			if ( ! current_user_can( 'edit_post', $campaign_id ) ) {
				wp_send_json_error( [ 'message' => $this->get_error_msg( 'permission' ) ] );
				return;
			}

			// Check if campaign is active/published
			if ( $campaign_post->post_status !== 'publish' ) {
				wp_send_json_error( [ 'message' => __( 'Campaign must be published to run.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Additional validation: Check if function exists
			if ( ! function_exists( 'wpaib_create_blog_post' ) ) {
				wp_send_json_error( [ 'message' => __( 'Campaign execution function not available.', 'wp-ai-blogger' ) ] );
				return;
			}

			// Run the campaign with error handling
			$post_id = wpaib_create_blog_post( $campaign_id );

			if ( is_wp_error( $post_id ) ) {
				wp_send_json_error( [
					'message' => $post_id->get_error_message(),
					'campaign_id' => $campaign_id
				] );
				return;
			}

			if ( ! $post_id ) {
				wp_send_json_error( [
					'message' => __( 'Failed to create post from campaign.', 'wp-ai-blogger' ),
					'campaign_id' => $campaign_id
				] );
				return;
			}

			// Get the created post details
			$created_post = get_post( $post_id );
			$post_title = $created_post ? $created_post->post_title : '';

			wp_send_json_success( [
				'message' => $this->get_error_msg( 'success' ),
				'post_id' => $post_id,
				'campaign_id' => $campaign_id,
				'post_title' => $post_title,
				'edit_link' => get_edit_post_link( $post_id, 'raw' ),
				'view_link' => get_permalink( $post_id ),
			] );

		} catch ( \Exception $e ) {
			wp_send_json_error( [
				'message' => $this->get_error_msg( 'default' ),
				'error' => 'Exception occurred during campaign execution'
			] );
		}
	}
}


