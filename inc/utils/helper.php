<?php
/**
 * Helper Class for WP AI Blogger.
 *
 * This class provides utility functions for settings management
 * with input validation, data sanitization, and security checks.
 *
 * @package wp-ai-blogger
 * @subpackage Utils
 * @since 1.0.0
 */

namespace WPAIBlogger\Inc\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Helper class for settings management.
 *
 * This class provides utility functions for managing plugin settings
 * with validation, sanitization, and access control.
 *
 * @package wp-ai-blogger
 * @subpackage Utils
 * @since 1.0.0
 */
class Helper {

	/**
	 * Allowed setting keys for security validation.
	 *
	 * @var array
	 */
	private static $allowed_keys = [
		'userOnboarded', 'onboardingTab', 'userName', 'userEmail', 'siteTitle',
		'siteDescription', 'siteFor', 'license', 'license_status', 'temperature',
		'harassment', 'hate', 'sexuallyExplicit', 'dangerousContent', 'postIdeas',
		'tokenTotal', 'tokenRemaining', 'apiKey', 'enableLogging'
	];

	/**
	 * Returns an option from the database for the admin settings.
	 *
	 * @param  string $key     The option key.
	 * @param  mixed  $default Option default value if option is not available.
	 * @return mixed   Returns the option value
	 *
	 * @since 1.0.0
	 */
	public static function get_option( $key, $default = false ) {
		// Validate key parameter
		if ( ! is_string( $key ) || empty( $key ) ) {
			return $default;
		}

		// Sanitize key
		$key = sanitize_key( $key );

		if ( empty( $key ) ) {
			return $default;
		}

		// Check if key is in allowed list (compare sanitized versions)
		$sanitized_allowed_keys = array_map('sanitize_key', self::$allowed_keys);
		if ( ! in_array( $key, $sanitized_allowed_keys, true ) ) {
			return $default;
		}

		// Get the original camelCase key for further processing
		$original_key_index = array_search($key, $sanitized_allowed_keys);
		$original_key = self::$allowed_keys[$original_key_index];

		$settings = Settings::get_ai_blogger_settings();

		if ( empty( $settings ) || ! is_array( $settings ) ) {
			return $default;
		}

		// Validate settings array
		if ( ! array_key_exists( $key, $settings ) ) {
			$settings[ $key ] = '';
		}

		$value = $settings[ $key ];

		// Return default if value is empty and default is provided
		if ( $value === '' && $default !== false ) {
			return $default;
		}

		// Sanitize output based on key type (use original camelCase key)
		return self::sanitize_output( $original_key, $value );
	}

	/**
	 * Update option in the database for the admin settings.
	 *
	 * @param  string $key      The option key.
	 * @param  mixed  $value    Option value to update.
	 * @return mixed            Return the sanitized option value
	 *
	 * @since 1.0.0
	 */
	public static function update_option( $key, $value = true ) {
		// Validate key parameter
		if ( ! is_string( $key ) || empty( $key ) ) {
			return false;
		}

		// Capability check
		if ( ! current_user_can( 'manage_options' ) && ! wp_doing_cron() && ! wp_doing_ajax() ) {
			return false;
		}

		// Sanitize key
		$key = sanitize_key( $key );

		if ( empty( $key ) ) {
			return false;
		}

		// Check if key is in allowed list (compare sanitized versions)
		$sanitized_allowed_keys = array_map('sanitize_key', self::$allowed_keys);
		if ( ! in_array( $key, $sanitized_allowed_keys, true ) ) {
			return false;
		}

		// Get the original camelCase key for switch statements
		$original_key_index = array_search($key, $sanitized_allowed_keys);
		$original_key = self::$allowed_keys[$original_key_index];

		// Sanitize value based on key type (use original camelCase key for switch)
		$sanitized_value = self::sanitize_input( $original_key, $value );

		if ( $sanitized_value === false ) {
			return false;
		}

		$settings = get_option( WP_AI_BLOGGER_DB_OPTION, [] );

		// Validate settings is array
		if ( ! is_array( $settings ) ) {
			$settings = [];
		}

		// If the value is same as default then remove it from the DB.
		if ( Settings::get_default_option( $original_key ) === $sanitized_value ) {
			unset( $settings[ $key ] );
		} else {
			$settings[ $key ] = $sanitized_value;
		}

		// Validate final settings array
		$validated_settings = self::validate_settings_array( $settings );

		update_option( WP_AI_BLOGGER_DB_OPTION, $validated_settings );

		return $sanitized_value;
	}	/**
	 * Delete option from the database for the admin settings.
	 *
	 * @param  string $key The option key.
	 * @return bool True on success, false on failure.
	 *
	 * @since 1.0.0
	 */
	public static function delete_option( $key ): bool {
		// Validate key parameter
		if ( ! is_string( $key ) || empty( $key ) ) {
			return false;
		}

		// Capability check
		if ( ! current_user_can( 'manage_options' ) && ! wp_doing_cron() ) {
			return false;
		}

		// Sanitize key
		$key = sanitize_key( $key );

		if ( empty( $key ) ) {
			return false;
		}

		// Check if key is in allowed list (compare sanitized versions)
		$sanitized_allowed_keys = array_map('sanitize_key', self::$allowed_keys);
		if ( ! in_array( $key, $sanitized_allowed_keys, true ) ) {
			return false;
		}

		$settings = get_option( WP_AI_BLOGGER_DB_OPTION, [] );

		// Validate settings is array
		if ( ! is_array( $settings ) ) {
			return true; // Nothing to delete
		}

		if ( ! isset( $settings[ $key ] ) ) {
			return true; // Key doesn't exist, consider it deleted
		}

		unset( $settings[ $key ] );

		// Validate final settings array
		$settings = self::validate_settings_array( $settings );

		return update_option( WP_AI_BLOGGER_DB_OPTION, $settings );
	}

	/**
	 * Sanitizes input values based on key type.
	 *
	 * @since 1.0.0
	 * @param string $key The option key.
	 * @param mixed  $value The value to sanitize.
	 * @return mixed|false Sanitized value or false on failure.
	 */
	private static function sanitize_input( string $key, $value ) {
		switch ( $key ) {
			case 'userOnboarded':
				return (bool) $value;

			case 'onboardingTab':
				$allowed_tabs = [ 'welcome', 'settings', 'license', 'complete' ];
				$value = sanitize_key( $value );
				return in_array( $value, $allowed_tabs, true ) ? $value : 'welcome';

			case 'userName':
				return sanitize_text_field( $value );

			case 'userEmail':
				$email = sanitize_email( $value );
				return is_email( $email ) ? $email : false;

			case 'siteTitle':
			case 'siteFor':
				return sanitize_text_field( $value );

			case 'siteDescription':
				return sanitize_textarea_field( $value );

			case 'license':
				$license = sanitize_text_field( $value );
				// License key validation
				if ( strlen( $license ) > 100 || ! preg_match( '/^[a-zA-Z0-9\-_]*$/', $license ) ) {
					return false;
				}
				return $license;

			case 'license_status':
				$allowed_statuses = [ 'licensed', 'unlicensed', 'expired', 'invalid' ];
				$status = sanitize_key( $value );
				return in_array( $status, $allowed_statuses, true ) ? $status : 'unlicensed';

			case 'temperature':
				$temp = (float) $value;
				return max( 0, min( 2, $temp ) );

			case 'harassment':
			case 'hate':
			case 'sexuallyExplicit':
			case 'dangerousContent':
				$level = absint( $value );
				return max( 0, min( 4, $level ) );

			case 'postIdeas':
				return sanitize_textarea_field( $value );

			case 'tokenTotal':
			case 'tokenRemaining':
				return absint( $value );

			case 'apiKey':
				$api_key = sanitize_text_field( $value );
				// Basic API key validation
				if ( strlen( $api_key ) > 200 || ! preg_match( '/^[a-zA-Z0-9\-_\.]*$/', $api_key ) ) {
					return false;
				}
				return $api_key;

			case 'enableLogging':
				return (bool) $value;

			default:
				// Unknown key type, apply basic sanitization
				if ( is_string( $value ) ) {
					return sanitize_text_field( $value );
				} elseif ( is_array( $value ) ) {
					return array_map( 'sanitize_text_field', $value );
				} elseif ( is_bool( $value ) ) {
					return (bool) $value;
				} elseif ( is_numeric( $value ) ) {
					return is_float( $value ) ? (float) $value : absint( $value );
				}
				return false;
		}
	}

	/**
	 * Sanitizes output values based on key type.
	 *
	 * @since 1.0.0
	 * @param string $key The option key.
	 * @param mixed  $value The value to sanitize.
	 * @return mixed Sanitized value.
	 */
	private static function sanitize_output( string $key, $value ) {
		switch ( $key ) {
			case 'userOnboarded':
			case 'enableLogging':
				return (bool) $value;

			case 'onboardingTab':
			case 'license_status':
				return sanitize_key( $value );

			case 'userName':
			case 'siteTitle':
			case 'siteFor':
			case 'license':
			case 'apiKey':
				return sanitize_text_field( $value );

			case 'userEmail':
				return sanitize_email( $value );

			case 'siteDescription':
				return sanitize_textarea_field( $value );

			case 'temperature':
				return (float) $value;

			case 'harassment':
			case 'hate':
			case 'sexuallyExplicit':
			case 'dangerousContent':
			case 'tokenTotal':
			case 'tokenRemaining':
				return absint( $value );

			case 'postIdeas':
				if ( ! is_array( $value ) ) {
					return [];
				}
				return array_map( 'sanitize_textarea_field', $value );

			default:
				// Default sanitization for unknown keys
				if ( is_string( $value ) ) {
					return sanitize_text_field( $value );
				}
				return $value;
		}
	}

	/**
	 * Validates the entire settings array for security.
	 *
	 * @since 1.0.0
	 * @param array $settings Settings array to validate.
	 * @return array Validated settings array.
	 */
	private static function validate_settings_array( array $settings ): array {
		$validated = [];
		$sanitized_allowed_keys = array_map('sanitize_key', self::$allowed_keys);

		foreach ( $settings as $key => $value ) {
			// Only include allowed keys (compare with sanitized versions)
			if ( in_array( $key, $sanitized_allowed_keys, true ) ) {
				// Get original camelCase key for sanitization
				$original_key_index = array_search($key, $sanitized_allowed_keys);
				$original_key = self::$allowed_keys[$original_key_index];

				$sanitized_value = self::sanitize_input( $original_key, $value );
				if ( $sanitized_value !== false ) {
					$validated[ $key ] = $sanitized_value;
				}
			}
		}

		return $validated;
	}

	/**
	 * Bulk update multiple options with validation.
	 *
	 * @since 1.0.0
	 * @param array $options Array of key-value pairs to update.
	 * @return bool True on success, false on failure.
	 */
	public static function bulk_update_options( array $options ): bool {
		// Capability check
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		$settings = get_option( WP_AI_BLOGGER_DB_OPTION, [] );

		if ( ! is_array( $settings ) ) {
			$settings = [];
		}

		$updated = false;

		$sanitized_allowed_keys = array_map('sanitize_key', self::$allowed_keys);

		foreach ( $options as $key => $value ) {
			$key = sanitize_key( $key );

			if ( ! in_array( $key, $sanitized_allowed_keys, true ) ) {
				continue;
			}

			// Get original camelCase key for sanitization
			$original_key_index = array_search($key, $sanitized_allowed_keys);
			$original_key = self::$allowed_keys[$original_key_index];

			$sanitized_value = self::sanitize_input( $original_key, $value );

			if ( $sanitized_value !== false ) {
				$settings[ $key ] = $sanitized_value;
				$updated = true;
			}
		}

		if ( $updated ) {
			$settings = self::validate_settings_array( $settings );
			return update_option( WP_AI_BLOGGER_DB_OPTION, $settings );
		}

		return true;
	}
}

