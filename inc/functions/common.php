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
	return apply_filters(
		'wpaib_post_statuses',
		[
			'publish' => __( 'Published', 'wp-ai-blogger' ),
			'future'  => __( 'Scheduled', 'wp-ai-blogger' ),
			'draft'   => __( 'Draft', 'wp-ai-blogger' ),
			'pending' => __( 'Pending Review', 'wp-ai-blogger' ),
			'private' => __( 'Private', 'wp-ai-blogger' ),
		]
	);
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

/**
 * Get all custom schedules to schedule auto blog posts.
 *
 * @return array
 * @since x.x.x
 */
function wpaib_get_schedules() {
	$schedules = get_option( 'wpaib_auto_blogging_schedules', [] );

	if ( empty( $schedules ) ) {
		return [];
	}

	foreach ( $schedules as $campaign_id => $days ) {
		$posts_target  = Metadata::get_campaign_meta( $campaign_id, 'postsTarget' );
		$posts_created = Metadata::get_campaign_meta( $campaign_id, 'postsCreated' );

		if ( $posts_target <= $posts_created ) {
			unset( $schedules[ $campaign_id ] );
		}
	}

	return $schedules;
}

/**
 * Get all custom schedules to schedule auto blog posts.
 *
 * @param int $campaign_id Campaign ID.
 * @param int $days       Days.
 * @return void
 * @since x.x.x
 */
function wpaib_update_schedules( $campaign_id, $days ): void {
	$schedules = wpaib_get_schedules();

	if ( ! empty( $schedules[ $campaign_id ] ) ) {
		$schedules[ $campaign_id ] = $days;
	} else {
		$schedules[ $campaign_id ] = $days;
	}

	update_option( 'wpaib_auto_blogging_schedules', $schedules );
}

/**
 * Check if the campaign posts target is achieved.
 *
 * @param int $campaign_id Campaign ID.
 * @return bool
 * @since x.x.x
 */
function wpaib_is_campaign_posts_target_achieved( $campaign_id ) {
	$posts_target  = absint( Metadata::get_campaign_meta( $campaign_id, 'postsTarget' ) );
	$posts_created = absint( Metadata::get_campaign_meta( $campaign_id, 'postsCreated' ) );

	if ( $posts_target <= $posts_created ) {
		return true;
	}

	return false;
}

/**
 * Get API response in order to create blog post.
 *
 * @param string $keywords         Keywords.
 * @param int    $max_title_words  Max title words.
 * @param int    $max_content_words Max content words.
 * @since x.x.x
 */
function wpaib_get_post_creation_api_response( $keywords, $max_title_words, $max_content_words ) {
	$api = WP_AI_BLOGGER_POST_CREATION_API;
	$api = add_query_arg(
		[
			'keywords'          => $keywords,
			'max_title_words'   => $max_title_words,
			'max_content_words' => $max_content_words,
			'license_key'       => WP_AI_BLOGGER_PUBLIC_TOKEN,
			'site_url'          => get_site_url(),
		],
		$api
	);

	$api_response = wp_safe_remote_get(
		$api,
		[
			'timeout' => 15,
			'headers' => [
				'Content-Type' => 'application/json',
			],
		]
	);

	// Check for errors.
	if ( is_wp_error( $api_response ) ) {
		return $api_response;
	}

	// Check for a valid response.
	if ( ! isset( $api_response['body'] ) ) {
		return new \WP_Error( 'invalid_response', __( 'Invalid response from API.', 'wp-ai-blogger' ) );
	}

	// Decode the response.
	$api_response = json_decode( wp_remote_retrieve_body( $api_response ), true );

	// Check for errors in the response.
	if ( isset( $api_response['error'] ) ) {
		return new \WP_Error( 'api_error', $api_response['error'] );
	}

	// Check for a valid response.
	if ( empty( $api_response['title'] ) || empty( $api_response['content'] ) ) {
		return new \WP_Error( 'invalid_response', __( 'Empty response from API for title or content.', 'wp-ai-blogger' ) );
	}

	return $api_response; // It's needed title, content and summary.
}

/**
 * Create blog post as per the campaign configurations.
 *
 * @param int $campaign_id Campaign ID.
 * @return int|WP_Error
 * @since x.x.x
 */
function wpaib_create_blog_post( $campaign_id ) {
	// General settings.
	$keywords           = Metadata::get_campaign_meta( $campaign_id, 'keywords' );
	$summary_as_excerpt = Metadata::get_campaign_meta( $campaign_id, 'summaryAsExcerpt' );

	// Filters settings.
	$post_type     = Metadata::get_campaign_meta( $campaign_id, 'postType' );
	$post_author   = Metadata::get_campaign_meta( $campaign_id, 'author' );
	$post_status   = Metadata::get_campaign_meta( $campaign_id, 'postStatus' );
	$post_category = Metadata::get_campaign_meta( $campaign_id, 'category' );
	$post_tag      = Metadata::get_campaign_meta( $campaign_id, 'tags' );

	// Advanced settings.
	$max_title_words   = Metadata::get_campaign_meta( $campaign_id, 'maxTitleWords' );
	$max_content_words = Metadata::get_campaign_meta( $campaign_id, 'maxWords' );

	// Perform the API call to get the content.
	$api_response = wpaib_get_post_creation_api_response( $keywords, $max_title_words, $max_content_words );

	if ( is_wp_error( $api_response ) ) {
		return $api_response;
	}

	// Create the post.
	$post_data = [
		'post_title'   => $api_response['title'],
		'post_content' => $api_response['content'],
		'post_type'    => $post_type,
		'post_status'  => $post_status,
		'post_author'  => $post_author,
	];
	if ( ! empty( $post_category ) ) {
		$post_data['post_category'] = [ $post_category ];
	}
	if ( ! empty( $post_tag ) ) {
		$post_data['tags_input'] = [ $post_tag ];
	}
	if ( $summary_as_excerpt ) {
		$post_data['post_excerpt'] = $api_response['summary'];
	}

	$post_id = wp_insert_post( $post_data );
	if ( is_wp_error( $post_id ) ) {
		return new \WP_Error( 'post_creation_failed', __( 'Failed to create the post.', 'wp-ai-blogger' ) );
	}

	// Update the campaign meta.
	$posts_created = absint( Metadata::get_campaign_meta( $campaign_id, 'postsCreated' ) );
	$posts_created = $posts_created ? $posts_created + 1 : 1;
	Metadata::update_campaign_meta( $campaign_id, 'postsCreated', $posts_created );

	Metadata::update_campaign_meta( $campaign_id, 'lastRun', time() );
	Metadata::update_campaign_meta( $campaign_id, 'lastPostID', $post_id );

	return $post_id;
}
