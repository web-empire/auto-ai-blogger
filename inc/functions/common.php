<?php
/**
 * Plugin functions.
 *
 * @package AutoBlog AI
 * @since x.x.x
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WPAIBlogger\Inc\Utils\Metadata;
use WPAIBlogger\Inc\Utils\Settings;

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
 * @since x.x.x
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
 * @since x.x.x
 */
function wpaib_get_all_campaigns() {
	$campaigns = get_posts(
		[
			'post_type'              => WP_AI_BLOGGER_CPT_CAMPAIGN,
			'posts_per_page'         => -1,
			'post_status'            => 'any',
			'orderby'                => 'date',
			'order'                  => 'ASC',
			'update_post_term_cache' => false,
			'update_post_meta_cache' => false,
		]
	);

	$campaigns_data = [];

	if ( ! is_wp_error( $campaigns ) && ! empty( $campaigns ) ) {
		foreach ( $campaigns as $campaign ) {
			$campaigns_data[ $campaign->ID ] = Metadata::get_campaign_data( $campaign->ID );
		}
	}

	return $campaigns_data;
}

/**
 * Get all generated posts.
 *
 * @since x.x.x
 */
function wpaib_get_generated_posts() {
	$generated_posts = get_posts(
		[
			'post_type'              => 'any',
			'posts_per_page'         => -1,
			'post_status'            => 'any',
			'orderby'                => 'date',
			'order'                  => 'ASC',
			'update_post_term_cache' => false,
			'update_post_meta_cache' => false,
			'meta_query'             => [
				[
					'key'     => 'wp_aib_campaign_id',
					'value'   => 1,
					'compare' => '=',
				],
			],
		]
	);

	$generated_posts_data = [];

	if ( ! is_wp_error( $generated_posts ) && ! empty( $generated_posts ) ) {
		foreach ( $generated_posts as $post ) {
			$generated_posts_data[ $post->ID ] = [
				'post_title'  => $post->post_title,
				'post_date'   => $post->post_date,
				'post_status' => $post->post_status,
				'post_type'   => $post->post_type,
				'post_id'     => $post->ID,
				'edit_link'   => add_query_arg(
					[
						'post'   => $post->ID,
						'action' => 'edit',
					],
					admin_url( 'post.php' )
				),
			];
		}
	}

	return $generated_posts_data;
}

/**
 * Get all post statuses.
 *
 * @since x.x.x
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
 * @since x.x.x
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
 * Get post categories.
 *
 * @since x.x.x
 */
function wpaib_get_categories() {
	$categories = get_categories(
		[
			'taxonomy'   => 'category',
			'hide_empty' => false,
		]
	);

	if ( is_wp_error( $categories ) || empty( $categories ) ) {
		return [];
	}

	$cats = [];
	foreach ( $categories as $category ) {
		$cats[ $category->term_id ] = $category->name;
	}
	return $cats;
}

/**
 * Get post tags.
 *
 * @since x.x.x
 */
function wpaib_get_tags() {
	$tags = get_tags(
		[
			'taxonomy'   => 'post_tag',
			'orderby'    => 'name',
			'hide_empty' => false,
		]
	);

	if ( is_wp_error( $tags ) || empty( $tags ) ) {
		return [];
	}

	$ts = [];
	foreach ( $tags as $tag ) {
		$ts[ $tag->term_id ] = $tag->name;
	}
	return $ts;
}

/**
 * Get all authors.
 *
 * @since x.x.x
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

	foreach ( $schedules as $campaign_id => $schedule_data ) {
		$posts_target  = Metadata::get_campaign_meta( $campaign_id, 'postsTarget' );
		$posts_created = Metadata::get_campaign_meta( $campaign_id, 'postsCreated' );

		if ( $posts_target <= $posts_created ) {
			unset( $schedules[ $campaign_id ] );
			continue;
		} elseif ( is_array( $schedule_data ) ) {
			// Ensure new format has all required fields.
			$schedules[ $campaign_id ] = wp_parse_args(
				$schedule_data,
				[
					'interval' => 1,
					'unit'     => 'day',
					'days'     => 1,
				]
			);
		}
	}

	return $schedules;
}

/**
 * Update campaign schedules with interval and unit.
 *
 * @param int    $campaign_id Campaign ID.
 * @param int    $interval    Repeat interval (number).
 * @param string $unit        Repeat unit (day, week, month, year).
 * @return void
 * @since x.x.x
 */
function wpaib_update_schedules( $campaign_id, $interval, $unit = 'day' ): void {
	// Validate inputs.
	$campaign_id = absint( $campaign_id );
	$interval    = absint( $interval );
	$unit        = sanitize_text_field( $unit );

	if ( ! $campaign_id || ! $interval ) {
		return;
	}

	// Validate unit.
	$allowed_units = [ 'day', 'week', 'month', 'year' ];
	if ( ! in_array( $unit, $allowed_units, true ) ) {
		$unit = 'day';
	}

	// Validate interval limits based on unit.
	$max_intervals = [
		'day'   => 365, // Max 1 year in days.
		'week'  => 52,  // Max 1 year in weeks.
		'month' => 24,  // Max 2 years in months.
		'year'  => 5,   // Max 5 years.
	];

	if ( $interval > $max_intervals[ $unit ] ) {
		$interval = $max_intervals[ $unit ];
	}

	$schedules = wpaib_get_schedules();

	// Store both interval and unit for new system.
	$schedules[ $campaign_id ] = [
		'interval' => $interval,
		'unit'     => $unit,
		'days'     => wpaib_convert_to_days( $interval, $unit ), // For backward compatibility.
	];

	update_option( 'wpaib_auto_blogging_schedules', $schedules );
}

/**
 * Convert interval and unit to days for scheduler compatibility.
 *
 * @param int    $interval Repeat interval.
 * @param string $unit     Repeat unit.
 * @return int Days equivalent.
 * @since x.x.x
 */
function wpaib_convert_to_days( $interval, $unit ): int {
	$multipliers = [
		'day'   => 1,
		'week'  => 7,
		'month' => 30, // Approximate.
		'year'  => 365, // Approximate.
	];

	return absint( $interval * ( $multipliers[ $unit ] ?? 1 ) );
}

/**
 * Clear campaign schedule from WP Cron.
 *
 * @param int $campaign_id Campaign ID.
 * @return void
 * @since x.x.x
 */
function wpaib_clear_campaign_schedule( $campaign_id ): void {
	$campaign_id = absint( $campaign_id );
	if ( ! $campaign_id ) {
		return;
	}

	$hook_name = 'wp_ai_blogger_create_blog_post';
	$args      = [ $campaign_id ];

	// Get next scheduled time.
	$timestamp = wp_next_scheduled( $hook_name, $args );

	if ( $timestamp ) {
		wp_unschedule_event( $timestamp, $hook_name, $args );
	}

	// Remove from schedules option.
	$schedules = get_option( 'wpaib_auto_blogging_schedules', [] );
	if ( isset( $schedules[ $campaign_id ] ) ) {
		unset( $schedules[ $campaign_id ] );
		update_option( 'wpaib_auto_blogging_schedules', $schedules );
	}
}

/**
 * Get formatted schedule display text.
 *
 * @param int $campaign_id Campaign ID.
 * @return string Formatted schedule text.
 * @since x.x.x
 */
function wpaib_get_campaign_schedule_display( $campaign_id ): string {
	$schedules = wpaib_get_schedules();

	if ( ! isset( $schedules[ $campaign_id ] ) ) {
		return __( 'Not scheduled', 'wp-ai-blogger' );
	}

	$schedule_data = $schedules[ $campaign_id ];
	$interval      = absint( $schedule_data['interval'] ?? 1 );
	$unit          = sanitize_text_field( $schedule_data['unit'] ?? 'day' );

	$unit_labels = [
		'day'   => _n( 'day', 'days', $interval, 'wp-ai-blogger' ),
		'week'  => _n( 'week', 'weeks', $interval, 'wp-ai-blogger' ),
		'month' => _n( 'month', 'months', $interval, 'wp-ai-blogger' ),
		'year'  => _n( 'year', 'years', $interval, 'wp-ai-blogger' ),
	];

	$unit_label = $unit_labels[ $unit ] ?? $unit;

	return sprintf(
		/* translators: %1$d: interval number, %2$s: time unit */
		__( 'Every %1$d %2$s', 'wp-ai-blogger' ),
		$interval,
		$unit_label
	);
}

/**
 * Cleanup function for plugin deactivation or campaign deletion.
 * Removes all scheduled events and clears schedules.
 *
 * @return void
 * @since x.x.x
 */
function wpaib_cleanup_all_schedules(): void {
	$schedules = get_option( 'wpaib_auto_blogging_schedules', [] );

	foreach ( array_keys( $schedules ) as $campaign_id ) {
		wpaib_clear_campaign_schedule( $campaign_id );
	}

	// Clear all scheduled events for this plugin.
	wp_clear_scheduled_hook( 'wp_ai_blogger_create_blog_post' );
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
 * @param array  $site_persona_details Site persona details.
 * @since x.x.x
 * @return array|WP_Error
 */
function wpaib_get_post_creation_api_response( $keywords, $max_title_words, $max_content_words, $site_persona_details ) {
	$core_details = [
		'keywords'      => $keywords,
		'maxTitleWords' => $max_title_words,
		'maxWords'      => $max_content_words,
		'license'       => WP_AI_BLOGGER_PUBLIC_TOKEN,
		'site_url'      => get_site_url(),
	];

	$api_response = wp_safe_remote_post(
		WP_AI_BLOGGER_POST_CREATION_API,
		[
			'body'        => wp_json_encode(
				array_merge(
					$core_details,
					$site_persona_details
				)
			),
			'timeout'     => 45,
			'headers'     => [
				'Content-Type' => 'application/json',
			],
			'cookies'     => [],
			'blocking'    => true, // Whether to block the request until complete.
			'redirection' => 10, // Number of redirects allowed.
			'httpversion' => '1.1',
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
 * Get site persona details.
 *
 * @param int $campaign_id Campaign ID.
 * @return array
 * @since x.x.x
 */
function wpaib_get_site_persona_details( $campaign_id = 0 ) {
	$site_details    = Settings::get_ai_blogger_settings();
	$persona_details = [
		'site_title'        => $site_details['siteTitle'] ?? '',
		'site_purpose'      => $site_details['siteFor'] ?? '',
		'site_description'  => $site_details['siteDescription'] ?? '',
		'temperature'       => $site_details['temperature'] ?? 0,
		'harassment'        => $site_details['harassment'] ?? 0,
		'hate'              => $site_details['hate'] ?? 0,
		'sexually_explicit' => $site_details['sexuallyExplicit'] ?? 0,
		'dangerous_content' => $site_details['dangerousContent'] ?? 0,
		'civic_integrity'   => $site_details['civicIntegrity'] ?? 0,
	];

	if ( $campaign_id ) {
		$override_site_details = Metadata::get_campaign_meta( $campaign_id, 'overrideSitePersona' );

		if ( $override_site_details ) {
			$overridden_site_title       = Metadata::get_campaign_meta( $campaign_id, 'overrideSiteTitle' ) ?? $site_details['siteTitle'];
			$overridden_site_description = Metadata::get_campaign_meta( $campaign_id, 'overrideSiteDescription' ) ?? $site_details['siteDescription'];
			$overridden_site_for         = Metadata::get_campaign_meta( $campaign_id, 'overrideSiteFor' ) ?? $site_details['siteFor'];

			$persona_details['site_title']       = $overridden_site_title;
			$persona_details['site_purpose']     = $overridden_site_for;
			$persona_details['site_description'] = $overridden_site_description;
		}
	}

	return $persona_details;
}

/**
 * Create blog post as per the campaign configurations.
 *
 * @param int $campaign_id Campaign ID.
 * @return int|WP_Error
 * @since x.x.x
 */
function wpaib_create_blog_post( $campaign_id ) {
	// Site persona settings.
	$site_persona_details = wpaib_get_site_persona_details( $campaign_id );

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
	$api_response = wpaib_get_post_creation_api_response( $keywords, $max_title_words, $max_content_words, $site_persona_details );

	if ( is_wp_error( $api_response ) ) {
		return $api_response;
	}

	// Create the post.
	$post_data = [
		'post_title'   => $api_response['post_title'],
		'post_content' => $api_response['post_content'],
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

	// Add campaign metadata to the created post.
	add_post_meta( $post_id, 'wp_aib_reference', 1 );
	add_post_meta( $post_id, 'wp_aib_campaign_id', $campaign_id );

	// Update the campaign meta.
	$posts_created = absint( Metadata::get_campaign_meta( $campaign_id, 'postsCreated' ) );
	$posts_created = $posts_created ? $posts_created + 1 : 1;
	Metadata::update_campaign_meta( $campaign_id, 'postsCreated', $posts_created );

	Metadata::update_campaign_meta( $campaign_id, 'lastRun', time() );
	Metadata::update_campaign_meta( $campaign_id, 'lastPostID', $post_id );

	return $post_id;
}

/**
 * Track post views for analytics.
 *
 * @param int $post_id Post ID.
 * @return void
 * @since x.x.x
 */
function wpaib_track_post_view( $post_id ): void {
	// Only track for campaign posts.
	$is_campaign_post = get_post_meta( $post_id, 'wp_aib_campaign_id', true );
	if ( ! $is_campaign_post ) {
		return;
	}

	// Avoid counting views from admin, logged-in users, or bots.
	if ( is_admin() || current_user_can( 'edit_posts' ) ) {
		return;
	}

	// Get current view count.
	$current_views = absint( get_post_meta( $post_id, 'post_views_count', true ) ?? 0 );

	// Increment view count.
	$new_views = $current_views + 1;

	// Update post meta.
	update_post_meta( $post_id, 'post_views_count', $new_views );
}
