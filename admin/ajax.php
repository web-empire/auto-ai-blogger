<?php
/**
 * Admin AJAX.
 *
 * @package wp-ai-blogger
 * @since 1.0.0
 */

namespace AutoBlogAI\Admin;

use AutoBlogAI\Inc\Traits\Get_Instance;
use AutoBlogAI\Inc\Utils\Helper;
use AutoBlogAI\Inc\Utils\Settings;

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

		if ( ! check_ajax_referer( 'wpaib_update_admin_setting', 'security', false ) ) {
			wp_send_json_error( [ 'message' => $this->get_error_msg( 'nonce' ) ] );
		}

		$type_settings  = Settings::get_all_type_wise_settings();
		$sub_option_key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';

		if ( ! empty( $type_settings[ $sub_option_key ] ) ) {
			$sub_option_value = Settings::sanitize_data( $_POST['value'], $type_settings[ $sub_option_key ] );
		} else {
			$sub_option_value = Settings::sanitize_data( $_POST['value'] );
		}

		Helper::update_option( $sub_option_key, $sub_option_value );

		wp_send_json_success( [ 'message' => $this->get_error_msg( 'success' ) ] );
	}
}
