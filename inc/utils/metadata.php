<?php
/**
 * Metadata.
 *
 * @package WPAIBlogger
 * @since x.x.x
 */

namespace WPAIBlogger\Inc\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * This class will holds the code related to the managing of settings of the plugin.
 *
 * @class Metadata
 */
class Metadata {
	/**
	 * Cache the DB options
	 *
	 * @since x.x.x
	 * @access public
	 * @var array
	 */
	public static $dashboard_options = [];

	/**
	 * Returns all default post settings.
	 *
	 * @return array
	 * @since x.x.x
	 */
	public static function get_settings_dataset() {
		return apply_filters(
			'wp_ai_blogger_postmeta_dataset',
			[
				'type'             => [
					'default' => 'new',
					'type'    => 'string',
				],
				'title'            => [
					'default' => '',
					'type'    => 'string',
				],
				'status'           => [
					'default' => 'publish',
					'type'    => 'string',
				],
				'keywords'         => [
					'default' => '',
					'type'    => 'string',
				],
				'postsTarget'      => [
					'default' => '',
					'type'    => 'number',
				],
				'frequency'        => [
					'default' => '',
					'type'    => 'number',
				],
				'postType'         => [
					'default' => 'post',
					'type'    => 'string',
				],
				'summaryAsExcerpt' => [
					'default' => false,
					'type'    => 'bool',
				],
				'author'           => [
					'default' => '',
					'type'    => 'string',
				],
				'category'         => [
					'default' => '',
					'type'    => 'string',
				],
				'tag'              => [
					'default' => '',
					'type'    => 'string',
				],
				'lastRun'          => [
					'default' => '',
					'type'    => 'string',
				],
				'lastPost'         => [
					'default' => '',
					'type'    => 'string',
				],
				'postsCreated'     => [
					'default' => 0,
					'type'    => 'number',
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
	 * Data cleaner
	 *
	 * @since x.x.x
	 * @access public
	 *
	 * @param mixed  $value     data from AJAX.
	 * @param string $data_type datatype to sanitize further.
	 *
	 * @return mixed Sanitized data.
	 */
	public static function sanitize_data( $value, $data_type = 'default' ) {
		$output = '';
		switch ( $data_type ) {
			case 'bool':
				$output = isset( $value ) && sanitize_text_field( $value ) === 'true' ? true : false;
				break;

			case 'int':
				$output = ! empty( $value ) ? absint( $value ) : '';
				break;

			case 'url':
				$output = ! empty( $value ) ? esc_url( $value ) : '';
				break;

			case 'array':
				$output = ! empty( $value ) ? wpaib_clean_data( $value ) : '';
				break;

			case 'html':
				$output = ! empty( $value ) ? wp_unslash( $value ) : '';
				break;

			case 'string':
			case 'default':
			default:
				$output = isset( $value ) ? sanitize_text_field( wp_unslash( $value ) ) : '';
				break;
		}

		return $output;
	}

	/**
	 * Format post metadata in a way that it can be saved in the database via wp_insert_post.
	 *
	 * @param array $postdata The metadata to format.
	 * @since x.x.x
	 * @return array The formatted metadata.
	 */
	public static function format_data( $postdata ) {
		$defaults = self::get_default_settings();

		$meta_data      = [];
		$skippable_keys = [ 'title', 'status', 'post_content', 'type', 'isNew' ]; // These keys are not metadata.
		foreach ( $postdata as $key => $value ) {
			if ( in_array( $key, $skippable_keys, true ) ) {
				continue;
			}
			$meta_data[ $key ] = $value;
		}

		return [
			'title'      => $postdata['title'] ?? $defaults['title'],
			'content'    => $postdata['post_content'] ?? '',
			'status'     => $postdata['status'] ?? $defaults['status'],
			'meta_input' => $meta_data,
		];
	}

	/**
	 * Get passed campaign post data.
	 *
	 * @param int $post_id The post ID.
	 * @since 0.0.1
	 * @return array|bool The campaign data or false if not found.
	 */
	public static function get_campaign_data( $post_id ) {
		$campaign      = get_post( $post_id );
		$defaults_meta = self::get_default_settings();

		if ( ! $campaign ) {
			return false;
		}

		if ( ! $campaign->post_type || $campaign->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
			return false;
		}

		$meta_posts_created = get_post_meta( $post_id, 'postsCreated', true );
		$meta_last_run      = get_post_meta( $post_id, 'lastRun', true );
		$meta_last_post     = get_post_meta( $post_id, 'lastPost', true );
		$meta_posts_target  = get_post_meta( $post_id, 'postsTarget', true );
		$meta_frequency     = get_post_meta( $post_id, 'frequency', true );

		$campaign_posts = absint( $meta_posts_created ?? $defaults_meta['postsCreated'] );
		$last_run       = ! empty( $meta_last_run ) ? $meta_last_run : $defaults_meta['lastRun'];
		$last_post      = ! empty( $meta_last_post ) ? $meta_last_post : $defaults_meta['lastPost'];
		$posts_target   = absint( $meta_posts_target ?? $defaults_meta['postsTarget'] );
		$frequency      = absint( $meta_frequency ?? $defaults_meta['frequency'] );

		$posts_target = $campaign_posts . ' / ' . $posts_target;
		$frequency    = __( 'Every', 'wp-ai-blogger' ) . ' ' . $frequency . ' ' . _n( 'Day', 'Days', $frequency, 'wp-ai-blogger' );

		return [
			'id'          => $campaign->ID,
			'name'        => $campaign->post_title,
			'title'       => $campaign->post_title,
			'status'      => $campaign->post_status,
			'created_at'  => $campaign->post_date,
			'updated_at'  => $campaign->post_modified,
			'lastRun'     => $last_run,
			'lastPost'    => $last_post,
			'postsTarget' => $posts_target,
			'frequency'   => $frequency,
		];
	}
}
