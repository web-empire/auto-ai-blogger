<?php
/**
 * Settings.
 *
 * @package AutoBlogAI
 * @since x.x.x
 */

namespace AutoBlogAI\Inc\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * This class will holds the code related to the managing of settings of the plugin.
 *
 * @class Settings
 */
class Settings {
	/**
	 * Cache the DB options
	 *
	 * @since x.x.x
	 * @access public
	 * @var array
	 */
	public static $dashboard_options = [];

	/**
	 * Returns all default portal settings.
	 *
	 * @return array
	 * @since x.x.x
	 */
	public static function get_settings_dataset() {
		return apply_filters(
			'autoblog_ai_settings_dataset',
			[
				'option_name' => [
					'default' => '',
					'type'    => 'string',
				],
			]
		);
	}

	/**
	 * Returns an option from the default options.
	 *
	 * @param  string $key     The option key.
	 * @param  mixed  $default Option default value if option is not available.
	 * @return mixed   Returns the option value
	 *
	 * @since x.x.x
	 */
	public static function get_default_option( $key, $default = false ) {
		$default_settings = self::get_default_settings();

		if ( ! is_array( $default_settings ) || ! array_key_exists( $key, $default_settings ) || empty( $default_settings ) ) {
			return $default;
		}

		return $default_settings[ $key ];
	}

	/**
	 * As per the settings dataset, return the default settings.
	 *
	 * @return array
	 * @since x.x.x
	 */
	public static function get_default_settings() {
		$settings_dataset = self::get_settings_dataset();

		$default_settings = [];

		foreach ( $settings_dataset as $key => $value ) {
			$default_settings[ $key ] = $value['default'];
		}

		return $default_settings;
	}

	/**
	 * Returns all portal settings.
	 *
	 * @return array
	 * @since x.x.x
	 */
	public static function get_blog_settings() {
		if ( ! empty( self::$dashboard_options ) ) {
			return self::$dashboard_options;
		}

		$db_option = get_option( WP_AUTOBLOG_AI_DB_OPTION, [] );

		$defaults = apply_filters( 'autoblog_ai_dashboard_rest_options', self::get_default_settings() );

		self::$dashboard_options = wp_parse_args( $db_option, $defaults );
		return self::$dashboard_options;
	}

	/**
	 * Get the type of the setting.
	 *
	 * @param string $key The setting key.
	 * @return string
	 * @since x.x.x
	 */
	public static function get_setting_type( $key ) {
		$settings_dataset = self::get_settings_dataset();

		if ( ! is_array( $settings_dataset ) || ! array_key_exists( $key, $settings_dataset ) ) {
			return 'string';
		}

		return $settings_dataset[ $key ]['type'];
	}
}
