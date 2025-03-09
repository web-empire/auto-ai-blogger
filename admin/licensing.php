<?php
/**
 * Licensing Class
 *
 * This class handles all licensing related stuff.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace AutoBlogAI\Admin;

use AutoBlogAI\Inc\Traits\Get_Instance;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Licensing handler class.
 *
 * @since x.x.x
 */
class Licensing {
	use Get_Instance;

	/**
	 * Error messages.
	 *
	 * @var array
	 */
	public $error_messages = [];

	/**
	 * Class constructor
	 *
	 * @since x.x.x
	 * @return void
	 */
	public function __construct() {
		if ( ! class_exists( 'SureCart\Licensing\Client' ) ) {
			require_once WP_AI_BLOGGER_DIR . '/inc/licensing/Client.php';
		}

		$this->set_error_messages();

		add_action( 'init', self::class . '::init_licensing' );
		add_action( 'admin_notices', [ $this, 'license_activation_notice' ] );

		add_action( 'wp_ajax_autoblog_ai_activate_license', [ $this, 'activate_license' ] );
		add_action( 'wp_ajax_autoblog_ai_deactivate_license', [ $this, 'deactivate_license' ] );
	}

	/**
	 * Licensing setup.
	 * Creates a client object for SureCart licensing.
	 *
	 * @since x.x.x
	 * @return \SureCart\Licensing\Client
	 */
	public static function licensing_setup() {
		$client = new \SureCart\Licensing\Client( WP_AI_BLOGGER_PRODUCT_NAME, WP_AI_BLOGGER_PUBLIC_TOKEN, WP_AI_BLOGGER_FILE );
		$client->set_textdomain( 'wp-ai-blogger' ); // @phpstan-ignore-line
		return $client;
	}

	/**
	 * Licensing setup.
	 * Creates a client object for SureCart licensing.
	 *
	 * @since x.x.x
	 * @return void
	 */
	public static function init_licensing(): void {
		self::licensing_setup();
	}

	/**
	 * Activate license
	 *
	 * @hooked wp_ajax_autoblog_ai_activate_license
	 * @since x.x.x
	 * @return void
	 */
	public function activate_license(): void {
		if ( ! check_ajax_referer( 'autoblog_ai_licensing_nonce', 'nonce', false ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['nonce'] ] );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['permission'] ] );
		}

		$license_key = ! empty( $_POST['license_key'] ) ? sanitize_text_field( wp_unslash( $_POST['license_key'] ) ) : '';

		if ( empty( $license_key ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['invalid_license'] ] );
		}

		$client = self::licensing_setup();

		$get_license = $client->license()->retrieve( $license_key );

		if ( ! empty( $get_license->product ) && $get_license->product !== WP_AI_BLOGGER_PRODUCT_ID ) {
			wp_send_json_error( [ 'message' => __( 'Incorrect License key for this product.', 'wp-ai-blogger' ) ] );
		}

		$response = $client->license()->activate( $license_key );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( [ 'message' => $response->get_error_message() ] );
		}

		// Update the license status in the database after activating the license.
		update_option( 'autoblog_ai_license_status', 'licensed' );
		wp_send_json_success( [ 'message' => __( 'License activated successfully.', 'wp-ai-blogger' ) ] );
	}

	/**
	 * Deactivate license.
	 *
	 * @hooked wp_ajax_autoblog_ai_deactivate_license
	 * @since x.x.x
	 * @return void
	 */
	public function deactivate_license(): void {
		if ( ! check_ajax_referer( 'autoblog_ai_licensing_nonce', 'nonce', false ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['nonce'] ] );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => $this->error_messages['permission'] ] );
		}

		$client = self::licensing_setup();

		$response = $client->license()->deactivate();

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( [ 'message' => $response->get_error_message() ] );
		}

		// Update the license status in the database after deactivating the license.
		update_option( 'autoblog_ai_license_status', 'unlicensed' );
		wp_send_json_success( [ 'message' => __( 'License deactivated successfully.', 'wp-ai-blogger' ) ] );
	}

	/**
	 * Checks if license is active.
	 *
	 * @since x.x.x
	 * @return bool
	 */
	public static function is_license_active() {
		$client = self::licensing_setup();

		// getting license key from settings.
		// We want to determine if the saved license key is valid for this product.
		$license_key = $client->settings()->license_key;

		if ( empty( $license_key ) ) {
			return false;
		}

		// retrieve the license from the server.
		$get_license = $client->license()->retrieve( $license_key );

		// if the license is not valid for this product, return false.
		if ( ! empty( $get_license->product ) && $get_license->product !== WP_AI_BLOGGER_PRODUCT_ID ) {
			return false;
		}

		$activation = $client->settings()->get_activation();
		return ! empty( $activation->id );
	}

	/**
	 * Display admin notice to activate license
	 *
	 * @since 1.0.0
	 */
	public function license_activation_notice(): void {
		$screen    = get_current_screen();
		$screen_id = ! empty( $screen->id ) ? $screen->id : '';

		if ( $screen_id !== 'plugins' ) {
			return;
		}

		if ( ! current_user_can( 'activate_plugins' ) || ! current_user_can( 'install_plugins' ) ) {
			return;
		}

		$license_status = get_option( 'autoblog_ai_license_status', '' );
		/**
		 * If the license status is not set then get the license status and update the option accordingly.
		 * This will be executed only once. Subsequently, the option status is updated by the licensing class on license activation or deactivation.
		 */
		if ( empty( $license_status ) ) {
			$license_status = Licensing::is_license_active() ? 'licensed' : 'unlicensed';
			update_option( 'autoblog_ai_license_status', $license_status );
		}

		if ( $license_status === 'licensed' ) {
			return;
		}

		$cta_url = admin_url( 'edit.php?page=' . WP_AI_BLOGGER_SLUG );

		/* translators: %s: html tags */
		$notice_message = sprintf( __( 'Please %1$s activate %2$s your copy to claim tokens %4$s %3$s %5$s to generate blog posts.', 'wp-ai-blogger' ), '<a href="' . esc_url( $cta_url ) . '">', '</a>', WP_AI_BLOGGER_PRODUCT_NAME, '<em>', '</em>' );

		\Web_Notices::add_notice(
			[
				'id'                         => 'wp-ai-blogger-activation-notice',
				'type'                       => 'error',
				/* translators: %s: html tags */
				'message'                    => sprintf(
					'<div class="notice-content" style="margin: 0;">
						%1$s
					</div>',
					$notice_message
				),
				'repeat-notice-after'        => false,
				'priority'                   => 10,
				'display-with-other-notices' => true,
				'is_dismissible'             => false,
			]
		);
	}

	/**
	 * Set error messages.
	 *
	 * @since x.x.x
	 * @return void
	 */
	private function set_error_messages(): void {
		$this->error_messages = [
			'nonce'           => __( 'Invalid nonce.', 'wp-ai-blogger' ),
			'permission'      => __( 'You do not have permission to activate license.', 'wp-ai-blogger' ),
			'invalid_license' => __( 'Please enter a valid license key', 'wp-ai-blogger' ),
		];
	}
}
