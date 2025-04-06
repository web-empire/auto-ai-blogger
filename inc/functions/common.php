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

use WPAIBlogger\Inc\Utils\Metadata;

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

/**
 * Clean variables using sanitize_text_field.
 *
 * @param mixed $var Data to sanitize.
 * @return mixed
 *
 * @since 0.0.1
 */
function wpaib_clean_data( $var ) {
	if ( is_array( $var ) ) {
		return array_map( 'wpaib_clean_data', $var );
	}
	return is_scalar( $var ) ? sanitize_text_field( (string) $var ) : $var;
}

/**
 * Get all campaigns.
 *
 * @since 0.0.1
 */
function wpaib_get_all_campaigns() {
	$campaigns = get_posts(
		[
			'post_type'      => WP_AI_BLOGGER_CPT_CAMPAIGN,
			'posts_per_page' => -1,
			'post_status'    => 'any',
			'orderby'        => 'date',
			'order'          => 'ASC',
		]
	);

	$campaigns_data = [];

	if ( ! empty( $campaigns ) ) {
		foreach ( $campaigns as $campaign ) {
			$campaigns_data[ $campaign->ID ] = Metadata::get_campaign_data( $campaign->ID );
		}
	}

	return $campaigns_data;
}

/**
 * Get all post statuses.
 *
 * @since 0.0.1
 */
function wpaib_get_post_statuses() {
	$post_statuses = apply_filters(
		'wpaib_post_statuses',
		[
			'publish' => __( 'Published', 'wp-ai-blogger' ),
			'future'  => __( 'Scheduled', 'wp-ai-blogger' ),
			'draft'   => __( 'Draft', 'wp-ai-blogger' ),
			'pending' => __( 'Pending Review', 'wp-ai-blogger' ),
			'private' => __( 'Private', 'wp-ai-blogger' ),
		]
	);
	return $post_statuses;
}

/**
 * Get all post types.
 *
 * @since 0.0.1
 */
function wpaib_get_post_types() {
	$queried_post_types = array_keys(
		get_post_types(
			apply_filters(
				'wpaib_post_types_query_args',
				[
					'public'   => true,
					'_builtin' => false,
				]
			),
			'objects'
		)
	);

	$queried_post_types   = array_diff(
		$queried_post_types,
		[
			WP_AI_BLOGGER_CPT_CAMPAIGN, // Considering by default.
			'sfwd-assignment',
			'sfwd-essays',
			'sfwd-transactions',
			'sfwd-certificates',
			'sfwd-quiz',
			'e-landing-page',
			'astra-advanced-hook',
			'astra_adv_header',
			'elementor_library',
			'brizy_template',
			'sc_collection',
			'course',
			'lesson',
			'llms_membership',
			'tutor_quiz',
			'tutor_assignments',
			'testimonial',
			'frm_display',
			'mec_esb',
			'mec-events',
		]
	);
	$queried_post_types[] = 'post';
	$queried_post_types[] = 'page';

	return $queried_post_types;
}

/**
 * Get all categories.
 *
 * @since 0.0.1
 */
function wpaib_get_categories() {
	$categories = get_categories();
	$cats       = [];
	foreach ( $categories as $category ) {
		$cats[ $category->term_id ] = $category->name;
	}
	return $cats;
}

/**
 * Get all tags.
 *
 * @since 0.0.1
 */
function wpaib_get_tags() {
	$tags = get_tags();
	$tag  = [];
	foreach ( $tags as $tag ) {
		$tag[ $tag->term_id ] = $tag->name;
	}
	return $tag;
}

/**
 * Get all authors.
 *
 * @since 0.0.1
 */
function wpaib_get_authors() {
	$users   = get_users();
	$authors = [];
	foreach ( $users as $user ) {
		$authors[ $user->ID ] = $user->display_name;
	}
	return $authors;
}
