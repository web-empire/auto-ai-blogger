<?php
/**
 * Licensing Class for WP AI Blogger.
 *
 * This class handles all licensing related operations with security measures.
 * Implements comprehensive input validation, data sanitization, rate limiting,
 * and secure license management.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 *
 */

namespace WPAIBlogger\Admin;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Helper;

defined( 'ABSPATH' ) || exit;

/**
 * Licensing handler class with security.
 *
 * This class provides license management including activation, deactivation,
 * validation, and status checking with security measures.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 */
class Licensing {
	use Get_Instance;

	/**
	 * Rate limit for license operations (per hour).
	 *
	 * @var int
	 */
	private const RATE_LIMIT_LICENSE_OPS = 10;

	/**
	 * Rate limiting time window in seconds (1 hour).
	 *
	 * @var int
	 */
	private const RATE_LIMIT_WINDOW = 3600;

	/**
	 * Maximum license key length.
	 *
	 * @var int
	 */
	private const MAX_LICENSE_KEY_LENGTH = 100;

	/**
	 * Error messages.
	 *
	 * @var array
	 */
	public $error_messages = [];

	/**
	 * Class constructor with security setup.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __construct() {
		// Only load licensing in admin area
		if ( ! is_admin() ) {
			return;
		}

		// Initialize licensing on init hook to ensure WordPress is fully loaded
		add_action( 'init', [ $this, 'initialize_licensing' ], 1 );
	}

	/**
	 * Initialize licensing functionality.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function initialize_licensing(): void {
		// Check if user has appropriate capabilities early
		if ( ! current_user_can( 'manage_options' ) && ! wp_doing_ajax() ) {
			return;
		}

		if ( ! class_exists( 'SureCart\Licensing\Client' ) ) {
			$client_path = WP_AI_BLOGGER_DIR . '/inc/licensing/Client.php';
			if ( file_exists( $client_path ) ) {
				require_once $client_path;
			} else {
				return;
			}
		}

		$this->set_error_messages();

		add_action( 'init', [ self::class, 'init_licensing' ] );
		add_action( 'admin_notices', [ $this, 'license_activation_notice' ] );

		// AJAX handlers with security validation
		add_action( 'wp_ajax_wp_ai_blogger_activate_license', [ $this, 'activate_license' ] );
		add_action( 'wp_ajax_wp_ai_blogger_deactivate_license', [ $this, 'deactivate_license' ] );

		// Add hooks for license validation
		add_action( 'wp_loaded', [ $this, 'validate_license_periodically' ] );
	}

	/**
	 * Licensing setup.
	 * Creates a client object for SureCart licensing.
	 *
	 * @since 1.0.0
	 * @return \SureCart\Licensing\Client
	 */
	public static function licensing_setup() {
		$client = new \SureCart\Licensing\Client( WP_AI_BLOGGER_PRODUCT_NAME, WP_AI_BLOGGER_PUBLIC_TOKEN, WP_AI_BLOGGER_FILE );
		$client->set_textdomain( 'wp-ai-blogger' );
		return $client;
	}

	/**
	 * Licensing setup.
	 * Creates a client object for SureCart licensing.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function init_licensing(): void {
		self::licensing_setup();
	}

	/**
	 * Activate license with security validation.
	 *
	 * @hooked wp_ajax_wp_ai_blogger_activate_license
	 * @since 1.0.0
	 * @return void
	 */
	public function activate_license(): void {
		// security validation
		$security_check = $this->validate_license_security();
		if ( is_wp_error( $security_check ) ) {
			wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
		}

		// Rate limiting check
		$rate_limit_check = $this->check_license_rate_limit( 'activate' );
		if ( is_wp_error( $rate_limit_check ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['rate_limit'] ] );
		}

		// Input validation and sanitization
		$license_key = $this->sanitize_license_key( $_POST['license_key'] ?? '' );
		if ( is_wp_error( $license_key ) ) {
			wp_send_json_error( [ 'message' => $license_key->get_error_message() ] );
		}

		// Additional Check if license key format is valid
		if ( ! $this->validate_license_key_format( $license_key ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['invalid_license_format'] ] );
		}

		try {
			$client = self::licensing_setup();

			if ( ! $client ) {
				wp_send_json_error( [ 'message' => $this->error_messages['client_error'] ] );
			}

			// Validate license before activation
			$get_license = $client->license()->retrieve( $license_key );

			if ( is_wp_error( $get_license ) ) {
				wp_send_json_error( [ 'message' => $this->error_messages['license_retrieval_failed'] ] );
			}

			// Validate product ID match
			if ( ! empty( $get_license->product ) && $get_license->product !== WP_AI_BLOGGER_PRODUCT_ID ) {
				wp_send_json_error( [ 'message' => $this->error_messages['incorrect_product'] ] );
			}

			// Attempt license activation
			$response = $client->license()->activate( $license_key );

			if ( is_wp_error( $response ) ) {
				wp_send_json_error( [ 'message' => $this->error_messages['activation_failed'] ] );
			}

			// Securely update license status
			$this->update_license_status( $license_key, 'licensed' );

			// Log successful activation
			$this->log_license_activity( 'activate', $license_key, get_current_user_id() );

			wp_send_json_success( [
				'message' => __( 'License activated successfully.', 'wp-ai-blogger' ),
				'status' => 'licensed'
			] );

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->error_messages['activation_exception'] ] );
		}
	}

	/**
	 * Deactivate license with security validation.
	 *
	 * @hooked wp_ajax_wp_ai_blogger_deactivate_license
	 * @since 1.0.0
	 * @return void
	 */
	public function deactivate_license(): void {
		// security validation
		$security_check = $this->validate_license_security();
		if ( is_wp_error( $security_check ) ) {
			wp_send_json_error( [ 'message' => $security_check->get_error_message() ] );
		}

		// Rate limiting check
		$rate_limit_check = $this->check_license_rate_limit( 'deactivate' );
		if ( is_wp_error( $rate_limit_check ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['rate_limit'] ] );
		}

		try {
			$client = self::licensing_setup();

			if ( ! $client ) {
				wp_send_json_error( [ 'message' => $this->error_messages['client_error'] ] );
			}

			// Get current license key for logging
			$current_license = Helper::get_option( 'license', '' );

			// Attempt license deactivation
			$response = $client->license()->deactivate();

			if ( is_wp_error( $response ) ) {
				wp_send_json_error( [ 'message' => $this->error_messages['deactivation_failed'] ] );
			}

			// Securely update license status
			$this->update_license_status( '', 'unlicensed' );

			// Log successful deactivation
			$this->log_license_activity( 'deactivate', $current_license, get_current_user_id() );

			wp_send_json_success( [
				'message' => __( 'License deactivated successfully.', 'wp-ai-blogger' ),
				'status' => 'unlicensed'
			] );

		} catch ( \Exception $e ) {
			wp_send_json_error( [ 'message' => $this->error_messages['deactivation_exception'] ] );
		}
	}

	/**
	 * Checks if license is active with security validation.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public static function is_license_active(): bool {
		try {
			$client = self::licensing_setup();

			if ( ! $client ) {
				return false;
			}

			// Getting license key from settings with validation.
			$license_key = $client->settings()->license_key;

			if ( empty( $license_key ) || ! is_string( $license_key ) ) {
				return false;
			}

			// Validate license key format
			if ( strlen( $license_key ) > self::MAX_LICENSE_KEY_LENGTH ) {
				return false;
			}

			// Retrieve the license from the server with error handling.
			$get_license = $client->license()->retrieve( $license_key );

			if ( is_wp_error( $get_license ) ) {
				return false;
			}

			// Validate product ID match
			if ( ! empty( $get_license->product ) && $get_license->product !== WP_AI_BLOGGER_PRODUCT_ID ) {
				return false;
			}

			// Check activation status
			$activation = $client->settings()->get_activation();
			$is_active = ! empty( $activation->id );

			// Update cached status for performance
			if ( $is_active ) {
				self::update_license_cache( $license_key, 'licensed' );
			}

			return $is_active;

		} catch ( \Exception $e ) {
			return false;
		}
	}

	/**
	 * Display admin notice to activate license with security.
	 *
	 * @since 1.0.0
	 */
	public function license_activation_notice(): void {
		// Only show notice to appropriate users
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$screen = get_current_screen();
		$screen_id = ! empty( $screen->id ) ? sanitize_key( $screen->id ) : '';

		// Only show on plugins page
		if ( $screen_id !== 'plugins' ) {
			return;
		}

		// Additional capability checks
		if ( ! current_user_can( 'activate_plugins' ) || ! current_user_can( 'install_plugins' ) ) {
			return;
		}

		// Get license status with caching
		$license_status = $this->get_cached_license_status();

		if ( $license_status === 'licensed' ) {
			return;
		}

		// Validate and escape CTA URL
		$cta_url = esc_url( admin_url( 'edit.php?page=' . WP_AI_BLOGGER_SLUG ) );

		if ( empty( $cta_url ) ) {
			return;
		}

		// Secure notice message with proper escaping
		$notice_message = sprintf(
			/* translators: %1$s: opening link tag, %2$s: closing link tag, %3$s: product name, %4$s: opening emphasis tag, %5$s: closing emphasis tag */
			__( 'Please %1$sactivate%2$s your copy to claim tokens %4$s%3$s%5$s to generate blog posts.', 'wp-ai-blogger' ),
			'<a href="' . $cta_url . '">',
			'</a>',
			esc_html( WP_AI_BLOGGER_PRODUCT_NAME ),
			'<em>',
			'</em>'
		);

		// Only show notice if Web_Notices class exists
		if ( class_exists( 'Web_Notices' ) ) {
			\Web_Notices::add_notice(
				[
					'id'                         => 'wp-ai-blogger-activation-notice',
					'type'                       => 'error',
					'message'                    => sprintf(
						'<div class="notice-content" style="margin: 0;">%s</div>',
						$notice_message
					),
					'repeat-notice-after'        => false,
					'priority'                   => 10,
					'display-with-other-notices' => true,
					'is_dismissible'             => false,
				]
			);
		}
	}

	/**
	 * Set comprehensive error messages with security context.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function set_error_messages(): void {
		$this->error_messages = [
			'nonce'                    => __( 'Security verification failed. Please try again.', 'wp-ai-blogger' ),
			'permission'               => __( 'You do not have permission to manage licenses.', 'wp-ai-blogger' ),
			'invalid_license'          => __( 'Please enter a valid license key.', 'wp-ai-blogger' ),
			'invalid_license_format'   => __( 'License key format is invalid.', 'wp-ai-blogger' ),
			'license_too_long'         => __( 'License key exceeds maximum allowed length.', 'wp-ai-blogger' ),
			'rate_limit'               => __( 'Too many license operations. Please try again later.', 'wp-ai-blogger' ),
			'client_error'             => __( 'License client initialization failed.', 'wp-ai-blogger' ),
			'license_retrieval_failed' => __( 'Failed to verify license. Please check your connection.', 'wp-ai-blogger' ),
			'incorrect_product'        => __( 'This license key is not valid for this product.', 'wp-ai-blogger' ),
			'activation_failed'        => __( 'License activation failed. Please try again.', 'wp-ai-blogger' ),
			'deactivation_failed'      => __( 'License deactivation failed. Please try again.', 'wp-ai-blogger' ),
			'activation_exception'     => __( 'An error occurred during license activation.', 'wp-ai-blogger' ),
			'deactivation_exception'   => __( 'An error occurred during license deactivation.', 'wp-ai-blogger' ),
		];
	}

	/**
	 * Validates security for license operations.
	 *
	 * @since 2.0.0
	 * @return bool|\WP_Error True if valid, WP_Error on failure.
	 */
	private function validate_license_security() {
		// CSRF protection
		if ( ! check_ajax_referer( 'wp_ai_blogger_licensing_nonce', 'wp_ai_blogger_licensing_nonce', false ) ) {
			return new \WP_Error( 'invalid_nonce', $this->error_messages['nonce'] );
		}

		// Capability check
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error( 'insufficient_permissions', $this->error_messages['permission'] );
		}

		// Additional Check if request is from admin
		if ( ! is_admin() ) {
			return new \WP_Error( 'invalid_context', 'License operations only allowed in admin context.' );
		}

		return true;
	}

	/**
	 * Check rate limiting for license operations.
	 *
	 * @since 2.0.0
	 * @param string $operation The operation type (activate/deactivate).
	 * @return bool|\WP_Error True if allowed, WP_Error if rate limited.
	 */
	private function check_license_rate_limit( string $operation ): \WP_Error|bool {
		$user_id = get_current_user_id();
		$cache_key = 'wp_ai_blogger_license_rate_limit_' . $user_id . '_' . $operation;

		// Get cached data
		$cached_data = get_transient( $cache_key );

		if ( false === $cached_data ) {
			// First request - set counter
			set_transient( $cache_key, [ 'count' => 1, 'start_time' => time() ], self::RATE_LIMIT_WINDOW );
			return true;
		}

		// Check if limit exceeded
		if ( $cached_data['count'] >= self::RATE_LIMIT_LICENSE_OPS ) {
			return new \WP_Error( 'rate_limit_exceeded', $this->error_messages['rate_limit'] );
		}

		// Increment counter
		$cached_data['count']++;
		set_transient( $cache_key, $cached_data, self::RATE_LIMIT_WINDOW );

		return true;
	}

	/**
	 * Sanitizes and validates license key.
	 *
	 * @since 2.0.0
	 * @param string $license_key Raw license key input.
	 * @return string|\WP_Error Sanitized license key or WP_Error on failure.
	 */
	private function sanitize_license_key( string $license_key ) {
		// Basic sanitization
		$license_key = sanitize_text_field( wp_unslash( $license_key ) );

		// Validation checks
		if ( empty( $license_key ) ) {
			return new \WP_Error( 'empty_license', $this->error_messages['invalid_license'] );
		}

		if ( strlen( $license_key ) > self::MAX_LICENSE_KEY_LENGTH ) {
			return new \WP_Error( 'license_too_long', $this->error_messages['license_too_long'] );
		}

		// Remove any suspicious characters
		$license_key = preg_replace( '/[^a-zA-Z0-9\-_]/', '', $license_key );

		if ( empty( $license_key ) ) {
			return new \WP_Error( 'invalid_characters', $this->error_messages['invalid_license_format'] );
		}

		return $license_key;
	}

	/**
	 * Validates license key format.
	 *
	 * @since 2.0.0
	 * @param string $license_key License key to validate.
	 * @return bool True if format is valid.
	 */
	private function validate_license_key_format( string $license_key ): bool {
		// Basic format validation
		if ( strlen( $license_key ) < 10 ) {
			return false;
		}

		// Check for valid characters only
		if ( ! preg_match( '/^[a-zA-Z0-9\-_]+$/', $license_key ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Securely updates license status in database.
	 *
	 * @since 2.0.0
	 * @param string $license_key License key to store.
	 * @param string $status License status.
	 * @return void
	 */
	private function update_license_status( string $license_key, string $status ): void {
		// Sanitize inputs
		$license_key = sanitize_text_field( $license_key );
		$status = sanitize_key( $status );

		// Validate status
		$allowed_statuses = [ 'licensed', 'unlicensed', 'expired', 'invalid' ];
		if ( ! in_array( $status, $allowed_statuses, true ) ) {
			$status = 'unlicensed';
		}

		// Update options securely
		Helper::update_option( 'license', $license_key );
		Helper::update_option( 'license_status', $status );

		// Update cache
		self::update_license_cache( $license_key, $status );
	}

	/**
	 * Logs license activity for security auditing.
	 *
	 * @since 2.0.0
	 * @param string $action The action performed.
	 * @param string $license_key License key (masked).
	 * @param int    $user_id User ID who performed action.
	 * @return void
	 */
	private function log_license_activity( string $action, string $license_key, int $user_id ): void {
		// Mask license key for security
		$masked_key = $this->mask_license_key( $license_key );

		$log_entry = sprintf(
			'WP AI Blogger License %s: User %d, License %s, IP %s, Time %s',
			ucfirst( sanitize_key( $action ) ),
			absint( $user_id ),
			$masked_key,
			$this->get_client_ip(),
			current_time( 'Y-m-d H:i:s' )
		);

		}

	/**
	 * Masks license key for logging.
	 *
	 * @since 2.0.0
	 * @param string $license_key License key to mask.
	 * @return string Masked license key.
	 */
	private function mask_license_key( string $license_key ): string {
		if ( strlen( $license_key ) <= 8 ) {
			return '****';
		}

		$start = substr( $license_key, 0, 4 );
		$end = substr( $license_key, -4 );
		$middle = str_repeat( '*', strlen( $license_key ) - 8 );

		return $start . $middle . $end;
	}

	/**
	 * Gets client IP address securely.
	 *
	 * @since 2.0.0
	 * @return string Client IP address.
	 */
	private function get_client_ip(): string {
		$ip_keys = [ 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR' ];

		foreach ( $ip_keys as $key ) {
			if ( ! empty( $_SERVER[ $key ] ) ) {
				$ip = sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) );
				// Take first IP if comma-separated
				$ip = explode( ',', $ip )[0];
				$ip = trim( $ip );

				if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
					return $ip;
				}
			}
		}

		return 'unknown';
	}

	/**
	 * Updates license cache for performance.
	 *
	 * @since 2.0.0
	 * @param string $license_key License key.
	 * @param string $status License status.
	 * @return void
	 */
	private static function update_license_cache( string $license_key, string $status ): void {
		$cache_key = 'wp_ai_blogger_license_cache';
		$cache_data = [
			'license_key' => sanitize_text_field( $license_key ),
			'status'      => sanitize_key( $status ),
			'updated'     => time(),
		];

		set_transient( $cache_key, $cache_data, HOUR_IN_SECONDS );
	}

	/**
	 * Gets cached license status.
	 *
	 * @since 2.0.0
	 * @return string License status.
	 */
	private function get_cached_license_status(): string {
		$license_status = Helper::get_option( 'license_status', '' );

		// If status is not set, check license and update
		if ( empty( $license_status ) ) {
			$license_status = self::is_license_active() ? 'licensed' : 'unlicensed';
			Helper::update_option( 'license_status', $license_status );
		}

		return sanitize_key( $license_status );
	}

	/**
	 * Validates license periodically for security.
	 *
	 * @since 2.0.0
	 * @return void
	 */
	public function validate_license_periodically(): void {
		// Only run validation once per day
		$last_validation = get_transient( 'wp_ai_blogger_license_validation' );
		if ( false !== $last_validation ) {
			return;
		}

		// Set validation timestamp
		set_transient( 'wp_ai_blogger_license_validation', time(), DAY_IN_SECONDS );

		// Check license status in background
		if ( function_exists( 'wp_schedule_single_event' ) ) {
			wp_schedule_single_event( time() + 300, 'wp_ai_blogger_validate_license_background' );
		}
	}
}


