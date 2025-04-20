<?php
/**
 * Metadata.
 *
 * @package WPAIBlogger
 * @since 0.0.1
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
	 * @since 0.0.1
	 * @access public
	 * @var array
	 */
	public static $dashboard_options = [];

	/**
	 * Returns all default post settings.
	 *
	 * @return array
	 * @since 0.0.1
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
				'postStatus'       => [
					'default' => 'publish',
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
					'default' => __( 'Never', 'wp-ai-blogger' ),
					'type'    => 'string',
				],
				'lastPostID'       => [
					'default' => '',
					'type'    => 'number',
				],
				'postsCreated'     => [
					'default' => 0,
					'type'    => 'number',
				],
				'maxWords'         => [
					'default' => 400,
					'type'    => 'number',
				],
				'maxTitleWords'    => [
					'default' => 8,
					'type'    => 'number',
				],
			]
		);
	}

	/**
	 * Returns the campaign meta value.
	 *
	 * @param int    $campaign_id The campaign ID.
	 * @param string $key         The meta key.
	 * @return string
	 *
	 * @since 0.0.1
	 */
	public static function get_campaign_meta( $campaign_id, $key ) {
		$meta_value = get_post_meta( $campaign_id, $key, true );

		if ( ! empty( $meta_value ) ) {
			return $meta_value;
		}

		return self::get_default_option( $key );
	}

	/**
	 * Update the campaign meta value.
	 *
	 * @param int    $campaign_id The campaign ID.
	 * @param string $key         The meta key.
	 * @param mixed  $value       The meta value.
	 * @return bool
	 *
	 * @since 0.0.1
	 */
	public static function update_campaign_meta( $campaign_id, $key, $value ) {
		$settings_dataset = self::get_settings_dataset();

		if ( ! array_key_exists( $key, $settings_dataset ) ) {
			return false;
		}

		$data_type = $settings_dataset[ $key ]['type'] ?? 'string';
		$value     = self::sanitize_data( $value, $data_type );

		return update_post_meta( $campaign_id, $key, $value );
	}

	/**
	 * Returns an option from the default options.
	 *
	 * @param  string $key     The option key.
	 * @param  mixed  $default Option default value if option is not available.
	 * @return mixed   Returns the option value
	 *
	 * @since 0.0.1
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
	 * @since 0.0.1
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
	 * @since 0.0.1
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
			case 'number':
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
	 * @since 0.0.1
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
	 * Get all campaign metadata as per the settings dataset.
	 *
	 * @param int $post_id The post ID.
	 * @return array<mixed> The metadata.
	 * @since 0.0.1
	 */
	public static function get_metadata( $post_id ) {
		$settings_dataset = self::get_settings_dataset();
		$metadata         = [];

		foreach ( $settings_dataset as $key => $value ) {
			$meta_value = get_post_meta( $post_id, $key, true );
			if ( ! empty( $meta_value ) ) {
				$metadata[ $key ] = $meta_value;
			} else {
				$metadata[ $key ] = $value['default'];
			}
		}

		return $metadata;
	}

	/**
	 * Get passed campaign post data.
	 *
	 * @param int  $post_id The post ID.
	 * @param bool $plain_metadata Whether to return plain metadata.
	 * @since 0.0.1
	 * @return array|bool The campaign data or false if not found.
	 */
	public static function get_campaign_data( $post_id, $plain_metadata = false ) {
		$campaign = get_post( $post_id );
		$metadata = self::get_metadata( $post_id );

		if ( ! $campaign ) {
			return false;
		}

		if ( ! $campaign->post_type || $campaign->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
			return false;
		}

		$meta_posts_created = absint( $metadata['postsCreated'] ?? 0 );
		$meta_posts_target  = absint( $metadata['postsTarget'] ?? 0 );
		$meta_frequency     = absint( $metadata['frequency'] ?? 0 );

		if ( ! $plain_metadata ) {
			$meta_posts_target       = $meta_posts_created . ' / ' . $meta_posts_target;
			$metadata['postsTarget'] = $meta_posts_target;

			$meta_frequency        = __( 'Every', 'wp-ai-blogger' ) . ' ' . $meta_frequency . ' ' . _n( 'Day', 'Days', $meta_frequency, 'wp-ai-blogger' );
			$metadata['frequency'] = $meta_frequency;
		}

		return array_merge(
			$metadata,
			[
				'id'              => $campaign->ID,
				'name'            => $campaign->post_title,
				'title'           => $campaign->post_title,
				'status'          => $campaign->post_status,
				'created_at'      => $campaign->post_date,
				'updated_at'      => $campaign->post_modified,
				'last_post_title' => get_the_title( $metadata['lastPostID'] ?? 0 ),
			]
		);
	}
}
