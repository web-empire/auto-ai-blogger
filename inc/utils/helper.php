<?php
/**
 * Helper.
 *
 * @package AutoBlogAI
 * @since x.x.x
 */

namespace AutoBlogAI\Inc\Utils;

/**
 * Initialize setup
 *
 * @since x.x.x
 * @package AutoBlogAI
 */

defined( 'ABSPATH' ) || exit;

/**
 * This class setup all Helper functions.
 *
 * @class Helper
 */
class Helper {
	/**
	 * Returns an option from the database for the admin settings.
	 *
	 * @param  string $key     The option key.
	 * @param  mixed  $default Option default value if option is not available.
	 * @return mixed   Returns the option value
	 *
	 * @since x.x.x
	 */
	public static function get_option( $key, $default = false ) {
		$settings = Settings::get_ai_blogger_settings();

		if ( empty( $settings ) || ! is_array( $settings ) || ! array_key_exists( $key, $settings ) ) {
			$settings[ $key ] = '';
		}

		// Get the setting option if we're in the admin panel.
		$value = $settings[ $key ];

		if ( $value === '' && $default !== false ) {
			return $default;
		}

		return $value;
	}

	/**
	 * Update option from the database for the admin settings.
	 *
	 * @param  string $key      The option key.
	 * @param  mixed  $value    Option value to update.
	 * @return string           Return the option value
	 *
	 * @since x.x.x
	 */
	public static function update_option( $key, $value = true ) {
		$settings = get_option( WP_AI_BLOGGER_DB_OPTION, [] );

		// If the value is same as default then remove it from the DB.
		// This will help in the translatable strings.
		if ( Settings::get_default_option( $key ) === $value ) {
			unset( $settings[ $key ] );
		} else {
			$settings[ $key ] = $value;
		}

		update_option( WP_AI_BLOGGER_DB_OPTION, $settings );

		return $value;
	}

	/**
	 * Delete option from the database for the admin settings.
	 *
	 * @param  string $key The option key.
	 * @return void
	 *
	 * @since x.x.x
	 */
	public static function delete_option( $key ) {
		$settings = get_option( WP_AI_BLOGGER_DB_OPTION, [] );

		if ( ! isset( $settings[ $key ] ) ) {
			return;
		}

		unset( $settings[ $key ] );

		update_option( WP_AI_BLOGGER_DB_OPTION, $settings );
	}
}
