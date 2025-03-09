<?php
/**
 * Plugin functions.
 *
 * @package AutoBlog AI
 * @since 0.0.1
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get user details.
 *
 * @param string $detail Detail to get.
 * @since x.x.x
 */
function wpaib_get_user_detail( $detail ) {
	$current_user = wp_get_current_user();
	switch ( $detail ) {
		case 'name':
			return ! empty( $current_user->user_firstname ) ? $current_user->user_firstname : $current_user->display_name;
		case 'email':
			return ! empty( $current_user->user_email ) ? $current_user->user_email : '';
		default:
			return '';
	}
}
