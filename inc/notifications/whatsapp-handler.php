<?php
/**
 * WhatsApp Handler for WP AI Blogger Notifications.
 *
 * Handles sending WhatsApp notifications via Twilio API.
 *
 * @package wp-ai-blogger
 * @subpackage Inc\Notifications
 * @since 1.0.0
 */

namespace WPAIBlogger\Inc\Notifications;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Helper;

defined( 'ABSPATH' ) || exit;

/**
 * WhatsApp Handler class.
 *
 * @package wp-ai-blogger
 * @subpackage Inc\Notifications
 * @since 1.0.0
 */
class WhatsApp_Handler {
	use Get_Instance;

	/**
	 * WhatsApp API endpoint.
	 *
	 * @var string
	 */
	private $api_endpoint = 'https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/send-whatsapp';

	/**
	 * Send WhatsApp notification.
	 *
	 * @param string $notification_type Type of notification.
	 * @param string $phone_number Phone number to send to.
	 * @param array  $data Notification data.
	 * @return bool True if sent successfully.
	 * @since 1.0.0
	 */
	public function send_notification( $notification_type, $phone_number, $data ): bool {
		$message = $this->get_message( $notification_type, $data );

		if ( empty( $message ) ) {
			return false;
		}

		return $this->send_whatsapp_message( $phone_number, $message );
	}

	/**
	 * Validate phone number format.
	 *
	 * @param string $phone_number Phone number to validate.
	 * @return bool True if valid.
	 * @since 1.0.0
	 */
	public function validate_phone_number( $phone_number ): bool {
		// Remove all non-digit characters except +.
		$cleaned = preg_replace( '/[^\d+]/', '', $phone_number );

		// Check if it matches international format: +[country code][number].
		// Should be between 10 and 15 digits including country code.
		return (bool) preg_match( '/^\+?[1-9]\d{9,14}$/', $cleaned );
	}

	/**
	 * Get WhatsApp message for notification type.
	 *
	 * @param string $notification_type Type of notification.
	 * @param array  $data Notification data.
	 * @return string WhatsApp message.
	 * @since 1.0.0
	 */
	private function get_message( $notification_type, $data ): string {
		switch ( $notification_type ) {
			case 'campaign_started':
				return $this->campaign_started_message( $data );
			case 'post_created':
				return $this->post_created_message( $data );
			case 'campaign_completed':
				return $this->campaign_completed_message( $data );
			case 'campaign_failed':
				return $this->campaign_failed_message( $data );
			default:
				return '';
		}
	}

	/**
	 * Campaign Started WhatsApp message.
	 *
	 * @param array $data Notification data.
	 * @return string WhatsApp message.
	 * @since 1.0.0
	 */
	private function campaign_started_message( $data ): string {
		$site_name = get_bloginfo( 'name' );

		$message  = "🚀 *Campaign Started*\n\n";
		$message .= sprintf( "*%s*\n\n", esc_html( $data['campaign_name'] ) );
		$message .= sprintf( "📊 Target: %d posts\n", $data['target_posts'] );
		$message .= sprintf( "⏰ Frequency: %s\n", esc_html( $data['frequency'] ) );
		$message .= sprintf( "🔑 Keywords: %s\n\n", esc_html( $data['keywords'] ) );
		$message .= sprintf( "View: %s\n\n", esc_url( $data['campaign_url'] ) );
		$message .= sprintf( '— %s', $site_name );

		return $message;
	}

	/**
	 * Post Created WhatsApp message.
	 *
	 * @param array $data Notification data.
	 * @return string WhatsApp message.
	 * @since 1.0.0
	 */
	private function post_created_message( $data ): string {
		$site_name = get_bloginfo( 'name' );

		$message  = "✅ *New Post Created*\n\n";
		$message .= sprintf( "*%s*\n\n", esc_html( $data['post_title'] ) );
		$message .= sprintf( "📝 Post #%d\n", $data['post_number'] );
		$message .= sprintf( "📊 Progress: %d / %d posts\n", $data['posts_created'], $data['posts_target'] );
		$message .= sprintf( "🏷️ Campaign: %s\n\n", esc_html( $data['campaign_name'] ) );
		$message .= sprintf( "View: %s\n", esc_url( $data['post_url'] ) );
		$message .= sprintf( "Edit: %s\n\n", esc_url( $data['edit_url'] ) );
		$message .= sprintf( '— %s', $site_name );

		return $message;
	}

	/**
	 * Campaign Completed WhatsApp message.
	 *
	 * @param array $data Notification data.
	 * @return string WhatsApp message.
	 * @since 1.0.0
	 */
	private function campaign_completed_message( $data ): string {
		$site_name = get_bloginfo( 'name' );

		$message  = "🎉 *Campaign Completed*\n\n";
		$message .= sprintf( "*%s*\n\n", esc_html( $data['campaign_name'] ) );
		$message .= sprintf( "✨ Total Posts: %d / %d\n", $data['posts_created'], $data['posts_target'] );
		$message .= sprintf( "✅ Status: Completed\n\n", $data['completion_time'] );
		$message .= sprintf( "View: %s\n\n", esc_url( $data['campaign_url'] ) );
		$message .= sprintf( '— %s', $site_name );

		return $message;
	}

	/**
	 * Campaign Failed WhatsApp message.
	 *
	 * @param array $data Notification data.
	 * @return string WhatsApp message.
	 * @since 1.0.0
	 */
	private function campaign_failed_message( $data ): string {
		$site_name = get_bloginfo( 'name' );

		$message  = "⚠️ *Campaign Failed*\n\n";
		$message .= sprintf( "*%s*\n\n", esc_html( $data['campaign_name'] ) );
		$message .= sprintf( "📊 Posts Created: %d / %d\n", $data['posts_created'], $data['posts_target'] );
		$message .= sprintf( "❌ Posts Failed: %d\n", $data['posts_failed'] );
		$message .= sprintf( "🔴 Reason: %s\n\n", esc_html( $data['failure_reason'] ) );
		$message .= "Please review your campaign settings.\n\n";
		$message .= sprintf( "Review: %s\n\n", esc_url( $data['campaign_url'] ) );
		$message .= sprintf( '— %s', $site_name );

		return $message;
	}

	/**
	 * Send WhatsApp message via API.
	 *
	 * @param string $phone_number Phone number to send to.
	 * @param string $message Message to send.
	 * @return bool True if sent successfully.
	 * @since 1.0.0
	 */
	private function send_whatsapp_message( $phone_number, $message ): bool {
		try {
			// Get license key for authentication.
			$license = Helper::get_option( 'license', '' );

			if ( empty( $license ) ) {
				return false;
			}

			$response = wp_remote_post(
				$this->api_endpoint,
				[
					'timeout' => 30,
					'headers' => [
						'Content-Type' => 'application/json',
						'User-Agent'   => 'WP-AI-Blogger/' . WP_AI_BLOGGER_VERSION,
					],
					'body'    => wp_json_encode(
						[
							'license'      => $license,
							'phone_number' => $phone_number,
							'message'      => $message,
						]
					),
				]
			);

			if ( is_wp_error( $response ) ) {
				return false;
			}

			$http_code = wp_remote_retrieve_response_code( $response );

			if ( $http_code !== 200 ) {
				$body = wp_remote_retrieve_body( $response );
				return false;
			}

			$body    = wp_remote_retrieve_body( $response );
			$decoded = json_decode( $body, true );

			if ( isset( $decoded['success'] ) && $decoded['success'] ) {
				return true;
			}

			return false;

		} catch ( \Exception $e ) {
			return false;
		}
	}
}
