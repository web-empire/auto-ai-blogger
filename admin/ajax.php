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
use WPAIBlogger\Inc\Utils\Settings;
use WPAIBlogger\Inc\Utils\Metadata;

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

		$campaign_id = absint( isset( $_POST['campaign_id'] ) ? $_POST['campaign_id'] : 0 );
		if ( ! $campaign_id ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'default' ) ] );
		}

		wp_send_json_success( Metadata::get_campaign_data( $campaign_id ) );
	}
}
