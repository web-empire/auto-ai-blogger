<?php
/**
 * Admin API class for WP AI Blogger.
 *
 * This class handles REST API endpoints for admin settings and operations.
 * Implements security measures including rate limiting, input validation,
 * and proper authentication.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 */

namespace WPAIBlogger\Admin;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Admin API class for WP AI Blogger.
 *
 * This class handles REST API endpoints for admin settings and operations.
 * Implements security measures including rate limiting, input validation,
 * and proper authentication.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 */
class API extends \WP_REST_Controller {
	use Get_Instance;

	/**
	 * Maximum requests per hour for rate limiting.
	 *
	 * @var int
	 */
	private const RATE_LIMIT_MAX_REQUESTS = 120;

	/**
	 * Rate limiting time window in seconds (1 hour).
	 *
	 * @var int
	 */
	private const RATE_LIMIT_WINDOW = 3600;

	/**
	 * Maximum request size in bytes (1MB).
	 *
	 * @var int
	 */
	private const MAX_REQUEST_SIZE = 1048576;

	/**
	 * Namespace.
	 *
	 * @var string
	 */
	protected $namespace = WP_AI_BLOGGER_SLUG . '/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = '/admin/settings/';

	/**
	 * Settings update route.
	 *
	 * @var string
	 */
	protected $update_route = '/admin/settings/update';

	/**
	 * License verification route.
	 *
	 * @var string
	 */
	protected $license_route = '/admin/license/';

	/**
	 * Option name
	 *
	 * @access private
	 * @var string $option_name DB option name.
	 * @since 1.0.0
	 */
	private static $option_name = WP_AI_BLOGGER_DB_OPTION;

	/**
	 * Admin settings dataset
	 *
	 * @access private
	 * @var array $ai_blogger_admin_settings Settings array.
	 * @since 1.0.0
	 */
	private static $ai_blogger_admin_settings = [];

	/**
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		self::$ai_blogger_admin_settings = get_option( self::$option_name, [] );
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );

		// Add security headers
		add_action( 'rest_api_init', [ $this, 'add_security_headers' ] );
	}

	/**
	 * Add security headers to API responses.
	 *
	 * @since 1.0.0
	 */
	public function add_security_headers(): void {
		add_filter( 'rest_pre_serve_request', [ $this, 'set_security_headers' ], 10, 4 );
	}

	/**
	 * Set security headers for API responses.
	 *
	 * @param bool                      $served  Whether the request has already been served.
	 * @param \WP_HTTP_Response_Interface $result  Result to send to the client.
	 * @param \WP_REST_Request           $request Request used to generate the response.
	 * @param \WP_REST_Server            $server  Server instance.
	 * @return bool
	 */
	public function set_security_headers( $served, $result, $request, $server ) {
		// Only apply to our API endpoints
		if ( strpos( $request->get_route(), $this->namespace ) === false ) {
			return $served;
		}

		// Security headers
		header( 'X-Content-Type-Options: nosniff' );
		header( 'X-Frame-Options: DENY' );
		header( 'X-XSS-Protection: 1; mode=block' );
		header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		header( 'Content-Security-Policy: default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\';' );

		return $served;
	}

	/**
	 * Register API routes.
	 *
	 * @since 1.0.0
	 */
	public function register_routes(): void {
		// GET settings endpoint
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_admin_settings' ],
					'permission_callback' => [ $this, 'get_permissions_check' ],
					'args'                => $this->get_settings_args(),
				],
				'schema' => [ $this, 'get_public_item_schema' ],
			]
		);

		// POST/PUT settings update endpoint
		register_rest_route(
			$this->namespace,
			$this->update_route,
			[
				[
					'methods'             => [ \WP_REST_Server::CREATABLE, \WP_REST_Server::EDITABLE ],
					'callback'            => [ $this, 'update_admin_settings' ],
					'permission_callback' => [ $this, 'update_permissions_check' ],
					'args'                => $this->get_update_args(),
				],
			]
		);

		// License management endpoints
		register_rest_route(
			$this->namespace,
			$this->license_route . 'verify',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'verify_license' ],
					'permission_callback' => [ $this, 'license_permissions_check' ],
					'args'                => $this->get_license_args(),
				],
			]
		);

		register_rest_route(
			$this->namespace,
			$this->license_route . 'activate',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'activate_license' ],
					'permission_callback' => [ $this, 'license_permissions_check' ],
					'args'                => $this->get_license_args(),
				],
			]
		);

		register_rest_route(
			$this->namespace,
			$this->license_route . 'deactivate',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'deactivate_license' ],
					'permission_callback' => [ $this, 'license_permissions_check' ],
					'args'                => [],
				],
			]
		);
	}

	/**
	 * Get common settings.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Settings data or error.
	 *
	 * @since 1.0.0
	 */
	public function get_admin_settings( $request ) {
		// Rate limiting check
		$rate_limit_check = $this->check_rate_limit( $request );
		if ( is_wp_error( $rate_limit_check ) ) {
			return $rate_limit_check;
		}

		// Get settings with proper error handling
		$settings = Settings::get_ai_blogger_settings();

		if ( ! is_array( $settings ) ) {
			return new \WP_Error(
				'settings_error',
				__( 'Failed to retrieve settings.', 'wp-ai-blogger' ),
				[ 'status' => 500 ]
			);
		}

		// Sanitize sensitive data before sending
		$safe_settings = $this->sanitize_settings_for_response( $settings );

		return rest_ensure_response( $safe_settings );
	}

	/**
	 * Update admin settings.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Updated settings or error.
	 *
	 * @since 1.0.0
	 */
	public function update_admin_settings( $request ) {
		// Rate limiting check
		$rate_limit_check = $this->check_rate_limit( $request );
		if ( is_wp_error( $rate_limit_check ) ) {
			return $rate_limit_check;
		}

		// Validate request size
		$request_size_check = $this->validate_request_size( $request );
		if ( is_wp_error( $request_size_check ) ) {
			return $request_size_check;
		}

		// Get and validate input data
		$settings_data = $request->get_json_params();

		if ( empty( $settings_data ) || ! is_array( $settings_data ) ) {
			return new \WP_Error(
				'invalid_data',
				__( 'Invalid settings data provided.', 'wp-ai-blogger' ),
				[ 'status' => 400 ]
			);
		}

		// Sanitize and validate settings
		$sanitized_settings = $this->sanitize_settings_data( $settings_data );
		if ( is_wp_error( $sanitized_settings ) ) {
			return $sanitized_settings;
		}

		// Update settings
		$updated = Settings::update_ai_blogger_settings( $sanitized_settings );

		if ( ! $updated ) {
			return new \WP_Error(
				'update_failed',
				__( 'Failed to update settings.', 'wp-ai-blogger' ),
				[ 'status' => 500 ]
			);
		}

		// Return updated settings
		$updated_settings = Settings::get_ai_blogger_settings();
		$safe_settings = $this->sanitize_settings_for_response( $updated_settings );

		return rest_ensure_response( [
			'success' => true,
			'message' => __( 'Settings updated successfully.', 'wp-ai-blogger' ),
			'data' => $safe_settings,
		] );
	}

	/**
	 * Check whether a given request has permission to read settings.
	 *
	 * @param  \WP_REST_Request $request Full details about the request.
	 * @return \WP_Error|bool
	 * @since 1.0.0
	 */
	public function get_permissions_check( $request ) {
		// Basic capability check
		if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
			return new \WP_Error(
				'wp_ai_blogger_rest_cannot_view',
				__( 'Sorry, you cannot access this resource.', 'wp-ai-blogger' ),
				[ 'status' => rest_authorization_required_code() ]
			);
		}

		// Additional security checks
		$security_check = $this->perform_security_checks( $request );
		if ( is_wp_error( $security_check ) ) {
			return $security_check;
		}

		return true;
	}

	/**
	 * Check whether a given request has permission to update settings.
	 *
	 * @param  \WP_REST_Request $request Full details about the request.
	 * @return \WP_Error|bool
	 * @since 1.0.0
	 */
	public function update_permissions_check( $request ) {
		// capability check for updates
		if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) || ! current_user_can( 'edit_posts' ) ) {
			return new \WP_Error(
				'wp_ai_blogger_rest_cannot_update',
				__( 'Sorry, you cannot update this resource.', 'wp-ai-blogger' ),
				[ 'status' => rest_authorization_required_code() ]
			);
		}

		// Verify nonce for additional security
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( empty( $nonce ) || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new \WP_Error(
				'invalid_nonce',
				__( 'Invalid security token.', 'wp-ai-blogger' ),
				[ 'status' => 403 ]
			);
		}

		// Additional security checks
		$security_check = $this->perform_security_checks( $request );
		if ( is_wp_error( $security_check ) ) {
			return $security_check;
		}

		return true;
	}

	/**
	 * Check whether a given request has permission to manage licenses.
	 *
	 * @param  \WP_REST_Request $request Full details about the request.
	 * @return \WP_Error|bool
	 * @since 1.0.0
	 */
	public function license_permissions_check( $request ) {
		// Admin-only capability for license management
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error(
				'wp_ai_blogger_rest_cannot_manage_license',
				__( 'Sorry, you cannot manage licenses.', 'wp-ai-blogger' ),
				[ 'status' => rest_authorization_required_code() ]
			);
		}

		// Additional security checks
		$security_check = $this->perform_security_checks( $request );
		if ( is_wp_error( $security_check ) ) {
			return $security_check;
		}

		return true;
	}

	/**
	 * Perform comprehensive security checks.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_Error|bool True if secure, WP_Error if blocked.
	 */
	private function perform_security_checks( $request ) {
		// Check for suspicious User-Agent
		$user_agent = $request->get_header( 'User-Agent' );
		if ( $this->is_suspicious_user_agent( $user_agent ) ) {
			return new \WP_Error(
				'suspicious_request',
				__( 'Request blocked for security reasons.', 'wp-ai-blogger' ),
				[ 'status' => 403 ]
			);
		}

		// Validate request origin (for AJAX requests)
		$referer = $request->get_header( 'Referer' );
		if ( ! empty( $referer ) && ! $this->is_valid_referer( $referer ) ) {
			return new \WP_Error(
				'invalid_origin',
				__( 'Invalid request origin.', 'wp-ai-blogger' ),
				[ 'status' => 403 ]
			);
		}

		// Check for content type on POST requests
		if ( in_array( $request->get_method(), [ 'POST', 'PUT', 'PATCH' ], true ) ) {
			$content_type = $request->get_header( 'Content-Type' );
			if ( empty( $content_type ) || strpos( $content_type, 'application/json' ) === false ) {
				return new \WP_Error(
					'invalid_content_type',
					__( 'Invalid content type. Expected application/json.', 'wp-ai-blogger' ),
					[ 'status' => 400 ]
				);
			}
		}

		return true;
	}

	/**
	 * Verify license with security.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error Response or error.
	 */
	public function verify_license( $request ) {
		// Implementation will be added when integrating with licensing system
		return new \WP_Error(
			'not_implemented',
			__( 'License verification not yet implemented.', 'wp-ai-blogger' ),
			[ 'status' => 501 ]
		);
	}

	/**
	 * Activate license with security.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error Response or error.
	 */
	public function activate_license( $request ) {
		// Implementation will be added when integrating with licensing system
		return new \WP_Error(
			'not_implemented',
			__( 'License activation not yet implemented.', 'wp-ai-blogger' ),
			[ 'status' => 501 ]
		);
	}

	/**
	 * Deactivate license with security.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error Response or error.
	 */
	public function deactivate_license( $request ) {
		// Implementation will be added when integrating with licensing system
		return new \WP_Error(
			'not_implemented',
			__( 'License deactivation not yet implemented.', 'wp-ai-blogger' ),
			[ 'status' => 501 ]
		);
	}

	/**
	 * Check rate limiting for the current request.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_Error|bool True if allowed, WP_Error if rate limited.
	 */
	private function check_rate_limit( $request ) {
		$client_ip = $this->get_client_ip();
		$user_id = get_current_user_id();

		// Create unique key for rate limiting (prefer user ID over IP)
		$rate_key = $user_id > 0 ? 'user_' . $user_id : 'ip_' . $client_ip;
		$cache_key = 'wp_ai_blogger_rate_limit_' . md5( $rate_key );

		// Get cached data
		$cached_data = get_transient( $cache_key );

		if ( false === $cached_data ) {
			// First request - set counter
			set_transient( $cache_key, [ 'count' => 1, 'start_time' => time() ], self::RATE_LIMIT_WINDOW );
			return true;
		}

		// Check if limit exceeded
		if ( $cached_data['count'] >= self::RATE_LIMIT_MAX_REQUESTS ) {
			return new \WP_Error(
				'rate_limit_exceeded',
				__( 'Too many requests. Please try again later.', 'wp-ai-blogger' ),
				[ 'status' => 429 ]
			);
		}

		// Increment counter
		$cached_data['count']++;
		set_transient( $cache_key, $cached_data, self::RATE_LIMIT_WINDOW );

		return true;
	}

	/**
	 * Get the client's IP address.
	 *
	 * @return string The client's IP address.
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
	 * Check for suspicious User-Agent patterns.
	 *
	 * @param string $user_agent The User-Agent header.
	 * @return bool True if suspicious, false otherwise.
	 */
	private function is_suspicious_user_agent( $user_agent ) {
		if ( empty( $user_agent ) ) {
			return true; // Block empty User-Agent
		}

		$suspicious_patterns = [
			'bot',
			'crawler',
			'spider',
			'scraper',
			'curl/7.', // Basic curl without custom user agent
			'wget',
			'python-requests',
			'libwww-perl',
			'java/',
			'go-http-client',
		];

		$user_agent_lower = strtolower( $user_agent );

		foreach ( $suspicious_patterns as $pattern ) {
			if ( strpos( $user_agent_lower, $pattern ) !== false ) {
				// Allow legitimate WordPress and known API clients
				if ( strpos( $user_agent_lower, 'wordpress' ) !== false ||
				     strpos( $user_agent_lower, 'wp-ai-blogger' ) !== false ) {
					return false;
				}
				return true;
			}
		}

		return false;
	}

	/**
	 * Validate if the referer is from a valid origin.
	 *
	 * @param string $referer The referer URL.
	 * @return bool True if valid, false otherwise.
	 */
	private function is_valid_referer( $referer ) {
		$site_url = get_site_url();
		$admin_url = admin_url();

		return strpos( $referer, $site_url ) === 0 || strpos( $referer, $admin_url ) === 0;
	}

	/**
	 * Validate request size.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_Error|bool True if valid, WP_Error if too large.
	 */
	private function validate_request_size( $request ) {
		$content_length = $request->get_header( 'Content-Length' );

		if ( ! empty( $content_length ) && (int) $content_length > self::MAX_REQUEST_SIZE ) {
			return new \WP_Error(
				'request_too_large',
				__( 'Request size exceeds maximum allowed limit.', 'wp-ai-blogger' ),
				[ 'status' => 413 ]
			);
		}

		return true;
	}

	/**
	 * Sanitize settings data for database storage.
	 *
	 * @param array $settings_data Raw settings data.
	 * @return array|\WP_Error Sanitized data or error.
	 */
	private function sanitize_settings_data( $settings_data ) {
		$sanitized = [];
		$allowed_keys = $this->get_allowed_setting_keys();

		foreach ( $settings_data as $key => $value ) {
			// Only allow whitelisted keys
			if ( ! in_array( $key, $allowed_keys, true ) ) {
				continue;
			}

			// Sanitize based on key type
			switch ( $key ) {
				case 'site_title':
				case 'site_purpose':
				case 'site_description':
					$sanitized[ $key ] = sanitize_text_field( $value );
					break;
				case 'harassment':
				case 'hate':
				case 'sexually_explicit':
				case 'dangerous_content':
					$sanitized[ $key ] = absint( $value );
					if ( $sanitized[ $key ] > 4 ) {
						$sanitized[ $key ] = 4;
					}
					break;
				case 'temperature':
					$sanitized[ $key ] = floatval( $value );
					if ( $sanitized[ $key ] < 0 ) {
						$sanitized[ $key ] = 0;
					} elseif ( $sanitized[ $key ] > 2 ) {
						$sanitized[ $key ] = 2;
					}
					break;
				case 'max_words':
				case 'max_title_words':
					$sanitized[ $key ] = absint( $value );
					if ( $sanitized[ $key ] < 1 ) {
						$sanitized[ $key ] = 1;
					} elseif ( $sanitized[ $key ] > 5000 ) {
						$sanitized[ $key ] = 5000;
					}
					break;
				default:
					$sanitized[ $key ] = sanitize_text_field( $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize settings for API response.
	 *
	 * @param array $settings Settings data.
	 * @return array Sanitized settings.
	 */
	private function sanitize_settings_for_response( $settings ) {
		$safe_settings = [];

		// Fields that should not be masked even if they contain sensitive keywords
		$non_sensitive_fields = [
			'tokenTotal',
			'tokenRemaining',
			'token_total',
			'token_remaining'
		];

		foreach ( $settings as $key => $value ) {
			// Mask sensitive data but exclude token count fields
			if ( in_array( $key, $non_sensitive_fields, true ) ) {
				// Don't mask token count fields - these are safe to expose
				$safe_settings[ $key ] = $value;
			} elseif ( strpos( $key, 'key' ) !== false || strpos( $key, 'token' ) !== false ) {
				$safe_settings[ $key ] = empty( $value ) ? '' : '***masked***';
			} else {
				$safe_settings[ $key ] = $value;
			}
		}

		return $safe_settings;
	}

	/**
	 * Get allowed setting keys for validation.
	 *
	 * @return array Array of allowed setting keys.
	 */
	private function get_allowed_setting_keys() {
		return [
			'site_title',
			'site_purpose',
			'site_description',
			'harassment',
			'hate',
			'sexually_explicit',
			'dangerous_content',
			'temperature',
			'max_words',
			'max_title_words',
			'post_ideas',
			'tokenTotal',
			'tokenRemaining',
			'token_total',
			'token_remaining',
			'license_status',
		];
	}

	/**
	 * Get arguments for settings endpoint.
	 *
	 * @return array Endpoint arguments.
	 */
	private function get_settings_args() {
		return [
			'context' => [
				'description' => __( 'Scope under which the request is made.', 'wp-ai-blogger' ),
				'type'        => 'string',
				'enum'        => [ 'view', 'edit' ],
				'default'     => 'view',
			],
		];
	}

	/**
	 * Get arguments for update endpoint.
	 *
	 * @return array Endpoint arguments.
	 */
	private function get_update_args() {
		return [
			'site_title' => [
				'description'       => __( 'Site title for persona context.', 'wp-ai-blogger' ),
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => function( $param ) {
					return is_string( $param ) && strlen( $param ) <= 200;
				},
			],
			'site_purpose' => [
				'description'       => __( 'Site purpose for persona context.', 'wp-ai-blogger' ),
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => function( $param ) {
					return is_string( $param ) && strlen( $param ) <= 500;
				},
			],
			'site_description' => [
				'description'       => __( 'Site description for persona context.', 'wp-ai-blogger' ),
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_textarea_field',
				'validate_callback' => function( $param ) {
					return is_string( $param ) && strlen( $param ) <= 1000;
				},
			],
			'temperature' => [
				'description'       => __( 'AI temperature setting (0-2).', 'wp-ai-blogger' ),
				'type'              => 'number',
				'validate_callback' => function( $param ) {
					return is_numeric( $param ) && $param >= 0 && $param <= 2;
				},
			],
		];
	}

	/**
	 * Get arguments for license endpoints.
	 *
	 * @return array Endpoint arguments.
	 */
	private function get_license_args() {
		return [
			'license_key' => [
				'description'       => __( 'License key for activation.', 'wp-ai-blogger' ),
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => function( $param ) {
					// Basic UUID format validation
					return preg_match( '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $param );
				},
			],
		];
	}
}


