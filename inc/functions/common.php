<?php
/**
 * Plugin Common Functions for WP AI Blogger.
 *
 * This file contains common utility functions with security measures.
 * All functions implement proper input validation, data sanitization, and
 * security checks to prevent unauthorized access and data manipulation.
 *
 * @package wp-ai-blogger
 * @subpackage Functions
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || exit;

use WPAIBlogger\Inc\Utils\Metadata;
use WPAIBlogger\Inc\Utils\Settings;

/**
 * Get user details with security validation.
 *
 * @param string $detail Detail to get (name|email).
 * @return string User detail or empty string on failure.
 * @since 1.0.0
 */
function wpaib_get_user_detail( $detail ) {
	// Validate input parameter.
	if ( ! is_string( $detail ) || empty( $detail ) ) {
		return '';
	}

	// Sanitize input.
	$detail = sanitize_key( $detail );

	// Check allowed detail types.
	$allowed_details = [ 'name', 'email' ];
	if ( ! in_array( $detail, $allowed_details, true ) ) {
		return '';
	}

	// Get current user safely.
	$current_user = wp_get_current_user();

	if ( ! $current_user || ! $current_user->exists() ) {
		return '';
	}

	switch ( $detail ) {
		case 'name':
			$name = ! empty( $current_user->user_firstname ) ?
				$current_user->user_firstname :
				$current_user->display_name;
			return sanitize_text_field( $name );

		case 'email':
			$email = ! empty( $current_user->user_email ) ?
				$current_user->user_email : '';
			return sanitize_email( $email );

		default:
			return '';
	}
}

/**
 * Clean the plugin data with security validation.
 *
 * @param mixed $data Data to clean.
 * @return mixed Cleaned data.
 * @since 1.0.0
 */
function wpaib_clean_data( $data ) {
	if ( is_array( $data ) ) {
		return array_map( 'wpaib_clean_data', $data );
	}
	return is_scalar( $data ) ? sanitize_text_field( (string) $data ) : $data;
}

/**
 * Get all campaigns with security validation.
 *
 * @since 1.0.0
 * @return array Sanitized campaigns data.
 */
function wpaib_get_all_campaigns() {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return [];
	}

	try {
		$campaigns = get_posts(
			[
				'post_type'              => WP_AI_BLOGGER_CPT_CAMPAIGN,
				'posts_per_page'         => 100, // Limit for performance.
				'post_status'            => [ 'publish', 'draft', 'private' ],
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'update_post_term_cache' => false,
				'update_post_meta_cache' => false,
			]
		);

		$campaigns_data = [];

		if ( ! is_wp_error( $campaigns ) && ! empty( $campaigns ) ) {
			foreach ( $campaigns as $campaign ) {
				// Validate campaign object.
				if ( ! $campaign instanceof WP_Post || $campaign->post_type !== WP_AI_BLOGGER_CPT_CAMPAIGN ) {
					continue;
				}

				// Check if user can read this campaign.
				if ( ! current_user_can( 'read_post', $campaign->ID ) ) {
					continue;
				}

				$campaign_data = Metadata::get_campaign_data( $campaign->ID );

				// Sanitize campaign data.
				if ( is_array( $campaign_data ) && ! empty( $campaign_data ) ) {
					$campaigns_data[ absint( $campaign->ID ) ] = $campaign_data;
				}
			}
		}

		return $campaigns_data;

	} catch ( \Exception $e ) {
		return [];
	}
}

/**
 * Get all generated posts with security validation.
 *
 * @since 1.0.0
 * @return array Sanitized generated posts data.
 */
function wpaib_get_generated_posts() {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return [];
	}

	try {
		$generated_posts = get_posts(
			[
				'post_type'              => get_post_types( [ 'public' => true ] ),
				'posts_per_page'         => -1, // Limit for performance.
				'post_status'            => [ 'publish', 'draft', 'private' ],
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'update_post_term_cache' => false,
				'update_post_meta_cache' => false,
				'meta_query'             => [
					[
						'key'     => 'wp_aib_reference',
						'value'   => 1,
						'compare' => '=',
					],
				],
			]
		);

		$posts_data = [];

		if ( ! is_wp_error( $generated_posts ) && ! empty( $generated_posts ) ) {
			foreach ( $generated_posts as $post ) {
				// Validate post object.
				if ( ! $post instanceof WP_Post ) {
					continue;
				}

				// Check if user can read this post.
				if ( ! current_user_can( 'read_post', $post->ID ) ) {
					continue;
				}

				// Sanitize post data.
				$posts_data[] = [
					'id'        => absint( $post->ID ),
					'title'     => sanitize_text_field( $post->post_title ),
					'status'    => sanitize_key( $post->post_status ),
					'type'      => sanitize_key( $post->post_type ),
					'date'      => sanitize_text_field( $post->post_date ),
					'modified'  => sanitize_text_field( $post->post_modified ),
					'author_id' => absint( $post->post_author ),
				];
			}
		}

		return $posts_data;

	} catch ( \Exception $e ) {
		return [];
	}
}

/**
 * Get array depth safely to prevent memory issues.
 *
 * @since x.x.x
 * @param array $array Array to check depth.
 * @return int Array depth.
 */
function wpaib_get_array_depth( array $array ): int {
	$max_depth = 1;

	foreach ( $array as $value ) {
		if ( is_array( $value ) ) {
			$depth = wpaib_get_array_depth( $value ) + 1;

			if ( $depth > $max_depth ) {
				$max_depth = $depth;
			}
		}
	}

	return $max_depth;
}

/**
 * Get all post statuses with security.
 *
 * @since 1.0.0
 * @return array Sanitized post statuses.
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
 * Get all post types with security validation.
 *
 * @since 1.0.0
 * @return array Sanitized post types.
 */
function wpaib_get_post_types() {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return [];
	}

	try {
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

		// Exclude sensitive post types.
		$excluded_post_types = apply_filters(
			'wpaib_excluded_post_types',
			[
				WP_AI_BLOGGER_CPT_CAMPAIGN,
				'sfwd-assignment',
				'sfwd-essays',
				'sfwd-transactions',
				'sfwd-certificates',
				'sfwd-quiz',
				'e-landing-page',
				'astra-advanced-hook',
				'cartflows_step',
				'cartflows_flow',
				'wp_block',
				'user_request',
				'oembed_cache',
				'sfwd-assignment',
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

		$queried_post_types = array_diff( $queried_post_types, $excluded_post_types );

		// Add built-in post types with security check.
		$builtin_post_types = [ 'post', 'page' ];

		foreach ( $builtin_post_types as $post_type ) {
			$post_type_obj = get_post_type_object( $post_type );
			if ( $post_type_obj && current_user_can( $post_type_obj->cap->edit_posts ) ) {
				$queried_post_types[] = $post_type;
			}
		}

		// Sanitize post type names and get labels.
		$sanitized_post_types = [];
		foreach ( $queried_post_types as $post_type ) {
			$post_type     = sanitize_key( $post_type );
			$post_type_obj = get_post_type_object( $post_type );

			if ( $post_type_obj && ! empty( $post_type_obj->labels->name ) ) {
				$sanitized_post_types[ $post_type ] = sanitize_text_field( $post_type_obj->labels->name );
			}
		}

		return $sanitized_post_types;

	} catch ( \Exception $e ) {
		return [ 'post' => 'Posts' ]; // Safe fallback.
	}
}

/**
 * Get post categories with security validation.
 *
 * @since 1.0.0
 * @return array Sanitized categories.
 */
function wpaib_get_categories() {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return [];
	}

	try {
		$categories = get_categories(
			[
				'taxonomy'   => 'category',
				'hide_empty' => false,
				'number'     => 200, // Limit for performance.
			]
		);

		if ( is_wp_error( $categories ) || empty( $categories ) ) {
			return [];
		}

		$cats = [];
		foreach ( $categories as $category ) {
			// Validate category object.
			if ( ! $category instanceof WP_Term ) {
				continue;
			}

			$cats[] = [
				'id'   => absint( $category->term_id ),
				'name' => sanitize_text_field( $category->name ),
				'slug' => sanitize_title( $category->slug ),
			];
		}

		return $cats;

	} catch ( \Exception $e ) {
		return [];
	}
}

/**
 * Get post tags with security validation.
 *
 * @since 1.0.0
 * @return array Sanitized tags.
 */
function wpaib_get_tags() {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return [];
	}

	try {
		$tags = get_tags(
			[
				'taxonomy'   => 'post_tag',
				'orderby'    => 'name',
				'hide_empty' => false,
				'number'     => 500, // Limit for performance.
			]
		);

		if ( is_wp_error( $tags ) || empty( $tags ) ) {
			return [];
		}

		$tag_list = [];
		foreach ( $tags as $tag ) {
			// Validate tag object.
			if ( ! $tag instanceof WP_Term ) {
				continue;
			}

			$tag_list[] = [
				'id'   => absint( $tag->term_id ),
				'name' => sanitize_text_field( $tag->name ),
				'slug' => sanitize_title( $tag->slug ),
			];
		}

		return $tag_list;

	} catch ( \Exception $e ) {
		return [];
	}
}

/**
 * Get all authors with security validation.
 *
 * @since 1.0.0
 * @return array Sanitized authors list.
 */
function wpaib_get_authors() {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return [];
	}

	try {
		$users = get_users(
			[
				'capability' => 'edit_posts',
				'number'     => 100, // Limit for performance.
				'orderby'    => 'display_name',
				'order'      => 'ASC',
			]
		);

		if ( is_wp_error( $users ) || empty( $users ) ) {
			return [];
		}

		$authors = [];
		foreach ( $users as $user ) {
			// Validate user object.
			if ( ! $user instanceof WP_User ) {
				continue;
			}

			$authors[] = [
				'id'    => absint( $user->ID ),
				'name'  => sanitize_text_field( $user->display_name ),
				'login' => sanitize_user( $user->user_login ),
			];
		}

		return $authors;

	} catch ( \Exception $e ) {
		return [];
	}
}

/**
 * Get all custom schedules to schedule auto blog posts with security.
 *
 * @return array Sanitized schedules.
 * @since 1.0.0
 */
function wpaib_get_schedules() {
	// Check user capabilities.
	if ( ! current_user_can( 'manage_options' ) ) {
		return [];
	}

	try {
		$schedules = get_option( 'wpaib_auto_blogging_schedules', [] );

		// Validate data structure.
		if ( ! is_array( $schedules ) || empty( $schedules ) ) {
			return [];
		}

		foreach ( $schedules as $campaign_id => $schedule_data ) {
			if ( wpaib_is_campaign_posts_target_achieved( $campaign_id ) ) {
				unset( $schedules[ $campaign_id ] );
				continue;
			}

			if ( is_array( $schedule_data ) ) {
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

	} catch ( \Exception $e ) {
		return [];
	}
}

/**
 * Check if the campaign posts target is achieved with security validation.
 *
 * @param int $campaign_id Campaign ID.
 * @return bool Target achievement status.
 * @since 1.0.0
 */
function wpaib_is_campaign_posts_target_achieved( $campaign_id ) {
	try {
		// Validate campaign ID.
		$campaign_id = absint( $campaign_id );
		if ( $campaign_id <= 0 ) {
			return false;
		}

		// Check user capabilities for campaign access.
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$posts_target  = absint( Metadata::get_campaign_meta( $campaign_id, 'postsTarget' ) );
		$posts_created = absint( Metadata::get_campaign_meta( $campaign_id, 'postsCreated' ) );

		// Validate metadata values.
		if ( $posts_target < 0 || $posts_created < 0 ) {
			return false;
		}

		return $posts_target > 0 && $posts_target <= $posts_created;

	} catch ( \Exception $e ) {
		return false;
	}
}

/**
 * Get API response to create blog post with security validation.
 *
 * @param string $keywords             Keywords.
 * @param int    $max_title_words      Max title words.
 * @param int    $max_content_words    Max content words.
 * @param array  $site_persona_details Site persona details.
 * @since 1.0.0
 * @return array|WP_Error Sanitized API response or error.
 */
function wpaib_get_post_creation_api_response( $keywords, $max_title_words, $max_content_words, $site_persona_details ) {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return new WP_Error( 'insufficient_permissions', 'Insufficient permissions to create posts.' );
	}

	try {
		// Validate and sanitize inputs.
		$keywords = sanitize_textarea_field( $keywords );
		if ( empty( $keywords ) || strlen( $keywords ) > 1000 ) {
			return new WP_Error( 'invalid_keywords', 'Invalid keywords provided.' );
		}

		$max_title_words = absint( $max_title_words );
		if ( $max_title_words < 1 || $max_title_words > 50 ) {
			$max_title_words = 10; // Safe default.
		}

		$max_content_words = absint( $max_content_words );
		if ( $max_content_words < 100 || $max_content_words > 5000 ) {
			$max_content_words = 500; // Safe default.
		}

		// Validate site persona details.
		if ( ! is_array( $site_persona_details ) ) {
			return new WP_Error( 'invalid_site_persona', 'Invalid site persona details.' );
		}

		// Sanitize site persona details.
		$sanitized_persona = [];
		$allowed_keys      = [ 'name', 'site_title', 'site_purpose', 'site_description' ];

		foreach ( $allowed_keys as $key ) {
			if ( isset( $site_persona_details[ $key ] ) ) {
				$sanitized_persona[ $key ] = sanitize_text_field( $site_persona_details[ $key ] );
			}
		}

		// Validate license token.
		$license = sanitize_text_field( WP_AI_BLOGGER_PUBLIC_TOKEN );
		if ( empty( $license ) ) {
			return new WP_Error( 'missing_license', 'License token is required.' );
		}

		// Prepare request body.
		$body_args = array_merge(
			[
				'keywords'      => explode( ',', $keywords ),
				'maxTitleWords' => $max_title_words,
				'maxWords'      => $max_content_words,
				'license'       => $license,
				'site_url'      => esc_url_raw( get_site_url() ),
			],
			$sanitized_persona
		);

		// Validate API endpoint.
		$api_url = WP_AI_BLOGGER_POST_CREATION_API;
		if ( ! filter_var( $api_url, FILTER_VALIDATE_URL ) ) {
			return new WP_Error( 'invalid_api_url', 'Invalid API endpoint.' );
		}

		$args = [
			'method'      => 'POST',
			'timeout'     => 30, // Reduced timeout for security.
			'redirection' => 5,  // Limited redirects.
			'httpversion' => '1.1',
			'blocking'    => true,
			'headers'     => [
				'Content-Type' => 'application/json',
				'User-Agent'   => 'WP-AI-Blogger/' . WP_AI_BLOGGER_VERSION,
			],
			'body'        => wp_json_encode( $body_args ),
			'cookies'     => [],
			'sslverify'   => true, // Enforce SSL verification.
		];

		$response = wp_remote_post( $api_url, $args );

		// Check for errors.
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Validate response.
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( $response_code !== 200 ) {
			return new WP_Error( 'api_error', "API returned status code: {$response_code}" );
		}

		$body = wp_remote_retrieve_body( $response );
		if ( empty( $body ) ) {
			return new WP_Error( 'empty_response', 'Empty response from API.' );
		}

		// Parse and validate JSON response.
		$data = json_decode( $body, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_Error( 'invalid_json', 'Invalid JSON response from API.' );
		}

		// Sanitize response data.
		if ( is_array( $data ) ) {
			$data = wpaib_sanitize_api_response( $data );
		}

		// Log successful API call (without sensitive data).

		return $data;

	} catch ( \Exception $e ) {
		return new WP_Error( 'api_exception', 'API request failed due to an exception.' );
	}
}

/**
 * Sanitize API response data recursively.
 *
 * @param array $data API response data.
 * @return array Sanitized data.
 */
function wpaib_sanitize_api_response( $data ) {
	if ( ! is_array( $data ) ) {
		return sanitize_text_field( $data );
	}

	$sanitized = [];
	foreach ( $data as $key => $value ) {
		$clean_key = sanitize_key( $key );

		if ( is_array( $value ) ) {
			$sanitized[ $clean_key ] = wpaib_sanitize_api_response( $value );
		} elseif ( is_string( $value ) ) {
			// Preserve HTML for content fields but sanitize.
			if ( in_array( $clean_key, [ 'content', 'excerpt' ], true ) ) {
				$sanitized[ $clean_key ] = wp_kses_post( $value );
			} else {
				$sanitized[ $clean_key ] = sanitize_text_field( $value );
			}
		} else {
			$sanitized[ $clean_key ] = $value;
		}
	}

	return $sanitized;
}

/**
 * Get site persona details with security validation.
 *
 * @param int $campaign_id Campaign ID.
 * @return array Sanitized site persona details.
 * @since 1.0.0
 */
function wpaib_get_site_persona_details( $campaign_id = 0 ) {
	// Check user capabilities.
	if ( ! current_user_can( 'edit_posts' ) ) {
		return [];
	}

	try {
		// Validate campaign ID.
		$campaign_id = absint( $campaign_id );

		$site_details = Settings::get_ai_blogger_settings();

		// Validate settings data.
		if ( ! is_array( $site_details ) ) {
			$site_details = [];
		}

		$persona_details = [
			'site_title'       => isset( $site_details['siteTitle'] ) ? sanitize_text_field( $site_details['siteTitle'] ) : '',
			'site_purpose'     => isset( $site_details['siteFor'] ) ? sanitize_textarea_field( $site_details['siteFor'] ) : '',
			'site_description' => isset( $site_details['siteDescription'] ) ? sanitize_textarea_field( $site_details['siteDescription'] ) : '',
		];

		// Handle campaign-specific overrides.
		if ( $campaign_id > 0 ) {
			$override_site_details = Metadata::get_campaign_meta( $campaign_id, 'overrideSitePersona' );

			if ( $override_site_details ) {
				$overridden_title = Metadata::get_campaign_meta( $campaign_id, 'overrideSiteTitle' );
				$overridden_desc  = Metadata::get_campaign_meta( $campaign_id, 'overrideSiteDescription' );
				$overridden_for   = Metadata::get_campaign_meta( $campaign_id, 'overrideSiteFor' );

				if ( ! empty( $overridden_title ) ) {
					$persona_details['site_title'] = sanitize_text_field( $overridden_title );
				}
				if ( ! empty( $overridden_desc ) ) {
					$persona_details['site_description'] = sanitize_textarea_field( $overridden_desc );
				}
				if ( ! empty( $overridden_for ) ) {
					$persona_details['site_purpose'] = sanitize_textarea_field( $overridden_for );
				}
			}
		}

		// Filter empty values.
		return array_filter(
			$persona_details,
			static function( $value ) {
				return ! empty( trim( $value ) );
			}
		);
	} catch ( \Exception $e ) {
		return [];
	}
}

/**
 * Create blog post as per the campaign configurations.
 *
 * @param int $campaign_id Campaign ID.
 * @return int|WP_Error
 * @since 1.0.0
 */
function wpaib_create_blog_post( $campaign_id ) {
	// Site persona settings..
	$site_persona_details = wpaib_get_site_persona_details( $campaign_id );

	// General settings..
	$keywords           = Metadata::get_campaign_meta( $campaign_id, 'keywords' );
	$summary_as_excerpt = Metadata::get_campaign_meta( $campaign_id, 'summaryAsExcerpt' );

	// Filters settings..
	$post_type     = Metadata::get_campaign_meta( $campaign_id, 'postType' );
	$post_author   = Metadata::get_campaign_meta( $campaign_id, 'author' );
	$post_status   = Metadata::get_campaign_meta( $campaign_id, 'postStatus' );
	$post_category = Metadata::get_campaign_meta( $campaign_id, 'category' );
	$post_tag      = Metadata::get_campaign_meta( $campaign_id, 'tags' );

	// Advanced settings.
	$is_pro_available  = defined( 'WP_AI_BLOGGER_PRO_VERSION' );
	$max_title_words   = $is_pro_available ? Metadata::get_campaign_meta( $campaign_id, 'maxTitleWords' ) : 10;
	$max_content_words = $is_pro_available ? Metadata::get_campaign_meta( $campaign_id, 'maxWords' ) : 1000;

	// Perform the API call to get the content.
	$api_response = wpaib_get_post_creation_api_response( $keywords, $max_title_words, $max_content_words, $site_persona_details );

	if ( is_wp_error( $api_response ) ) {
		return $api_response;
	}

	// Create the post..
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
		'days'     => wpaib_convert_to_days( $interval, $unit ),
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
