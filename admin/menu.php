<?php
/**
 * Admin Menu class for WP AI Blogger.
 *
 * This class handles secure admin menu setup, script loading, and data localization.
 * Implements comprehensive security measures including input validation,
 * data sanitization, and secure script loading.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 *
 */

namespace WPAIBlogger\Admin;

use WPAIBlogger\Inc\Traits\Get_Instance;
use WPAIBlogger\Inc\Utils\Helper;
use WPAIBlogger\Inc\Utils\Metadata;

defined( 'ABSPATH' ) || exit;

/**
 * Admin Menu class for WP AI Blogger.
 *
 * This class handles secure admin menu setup, script loading, and data localization.
 * Implements comprehensive security measures including input validation,
 * data sanitization, and secure script loading.
 *
 * @package wp-ai-blogger
 * @subpackage Admin
 * @since 1.0.0
 */
class Menu {
	use Get_Instance;



	/**
	 * Settings page ID for Plugin settings.
	 */
	public const PAGE_ID = WP_AI_BLOGGER_SLUG;

	/**
	 * Constructor with security setup.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __construct() {
		$this->initialize_hooks();

		add_action( 'admin_init', [ $this, 'settings_admin_scripts' ] );

		// Add security headers for admin pages
		add_action( 'admin_head', [ $this, 'add_admin_security_headers' ] );
	}

	/**
	 * Add security headers for admin pages.
	 *
	 * @since 2.0.0
	 */
	public function add_admin_security_headers(): void {
		// Only add headers on our plugin pages
		if ( ! $this->is_plugin_admin_page() ) {
			return;
		}

		// Add Content Security Policy
		if ( ! headers_sent() ) {
			header( "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://wpaiblogger.com;" );
			header( 'X-Content-Type-Options: nosniff' );
			header( 'X-Frame-Options: SAMEORIGIN' );
			header( 'X-XSS-Protection: 1; mode=block' );
			header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		}
	}

	/**
	 * Check if current page is our plugin admin page.
	 *
	 * @return bool
	 * @since 2.0.0
	 */
	private function is_plugin_admin_page(): bool {
		$page = $_GET['page'] ?? '';

		if ( empty( $page ) ) {
			return false;
		}

		$page = sanitize_text_field( wp_unslash( $page ) );

		return $page === self::PAGE_ID || strpos( $page, self::PAGE_ID . '_' ) === 0;
	}

	/**
	 * Initialize Admin Setup with security.
	 *
	 * @since 1.0.0
	 */
	public function settings_admin_scripts(): void {
		// input validation and sanitization
		if ( empty( $_GET['page'] ) ) {
			return;
		}

		$page = sanitize_text_field( wp_unslash( $_GET['page'] ) );

		// Validate page parameter against expected values
		if ( $page !== self::PAGE_ID && strpos( $page, self::PAGE_ID . '_' ) !== 0 ) {
			return;
		}

		// Check user capabilities
		if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', [ $this, 'app_build_scripts' ] );

		// Remove WordPress footer text securely
		add_filter(
			'admin_footer_text',
			function() {
				// Only modify footer on our pages for security
				if ( $this->is_plugin_admin_page() ) {
					return '';
				}
				return null; // Return null to preserve original behavior on other pages
			}
		);

		add_filter(
			'update_footer',
			function() {
				// Only modify footer on our pages for security
				if ( $this->is_plugin_admin_page() ) {
					return '';
				}
				return null; // Return null to preserve original behavior on other pages
			}
		);
	}

	/**
	 * Renders the hub screen canvas with security validation.
	 *
	 * @since 1.0.0
	 */
	public function render_settings_page(): void {
		// Security validation before rendering
		if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'wp-ai-blogger' ) );
		}

		// Additional CSRF protection
		$nonce = wp_create_nonce( 'wp_ai_blogger_admin_page' );

		echo '<div id="autoblog-main-page--wrapper" data-nonce="' . esc_attr( $nonce ) . '"></div>';
	}

	/**
	 * Enqueue the Admin's build files for plugin to work with security.
	 *
	 * @since 1.0.0
	 */
	public function app_build_scripts(): void {
		// Security checks
		if ( is_customize_preview() ) {
			return;
		}

		if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
			return;
		}

		if ( ! $this->is_plugin_admin_page() ) {
			return;
		}

		// Sanitized data collection
		$blog_name = sanitize_text_field( get_bloginfo( 'name' ) );
		$admin_site_email_address = sanitize_email( get_option( 'admin_email' ) );

		// Safely get settings with error handling
		$site_title = '';
		$site_description = '';
		$site_for = '';
		$license = '';
		$temperature = 1.0;
		$harassment = 0;
		$hate = 0;
		$sexually_explicit = 0;
		$dangerous_content = 0;
		$post_ideas = [];
		$token_total = 0;
		$token_remaining = 0;
		$license_status = 'unlicensed';

		try {
			$site_title = sanitize_text_field( Helper::get_option( 'siteTitle', '' ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get siteTitle - ' . $e->getMessage() );
		}

		try {
			$site_description = sanitize_textarea_field( Helper::get_option( 'siteDescription', '' ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get siteDescription - ' . $e->getMessage() );
		}

		try {
			$site_for = sanitize_text_field( Helper::get_option( 'siteFor', '' ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get siteFor - ' . $e->getMessage() );
		}

		try {
			// License is always stored as a string
			$license = sanitize_text_field( Helper::get_option( 'license', '' ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get license - ' . $e->getMessage() );
		}

		try {
			$temperature = (float) Helper::get_option( 'temperature', 1 );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get temperature - ' . $e->getMessage() );
		}

		try {
			$harassment = absint( Helper::get_option( 'harassment', 0 ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get harassment - ' . $e->getMessage() );
		}

		try {
			$hate = absint( Helper::get_option( 'hate', 0 ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get hate - ' . $e->getMessage() );
		}

		try {
			$sexually_explicit = absint( Helper::get_option( 'sexuallyExplicit', 0 ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get sexuallyExplicit - ' . $e->getMessage() );
		}

		try {
			$dangerous_content = absint( Helper::get_option( 'dangerousContent', 0 ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get dangerousContent - ' . $e->getMessage() );
		}

		try {
			$post_ideas = $this->sanitize_post_ideas( Helper::get_option( 'postIdeas', [] ) );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get postIdeas - ' . $e->getMessage() );
		}

		// Get token and license data with proper defaults
		$token_total = absint( Helper::get_option( 'tokenTotal', 0 ) );
		$token_remaining = absint( Helper::get_option( 'tokenRemaining', 0 ) );
		$license_status = sanitize_key( Helper::get_option( 'license_status', 'unlicensed' ) );

		// Get data with error handling
		$post_statuses = [];
		$categories = [];
		$tags = [];
		$authors = [];
		$post_types = [];
		$postmeta_defaults = [];
		$all_campaigns = [];
		$generated_posts = [];

		try {
			$post_statuses = $this->get_sanitized_post_statuses();
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get post statuses - ' . $e->getMessage() );
		}

		try {
			$categories = $this->get_sanitized_categories();
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get categories - ' . $e->getMessage() );
		}

		try {
			$tags = $this->get_sanitized_tags();
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get tags - ' . $e->getMessage() );
		}

		try {
			$authors = $this->get_sanitized_authors();
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get authors - ' . $e->getMessage() );
		}

		try {
			$post_types = $this->get_sanitized_post_types();
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get post types - ' . $e->getMessage() );
		}

		try {
			$postmeta_defaults = $this->sanitize_metadata_defaults( Metadata::get_default_settings() );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get metadata defaults - ' . $e->getMessage() );
		}

		try {
			$all_campaigns = $this->sanitize_campaigns_data( wpaib_get_all_campaigns() );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get campaigns - ' . $e->getMessage() );
		}

		try {
			$generated_posts = $this->sanitize_posts_data( wpaib_get_generated_posts() );
		} catch ( Exception $e ) {
			error_log( 'WP AI Blogger: Failed to get generated posts - ' . $e->getMessage() );
		}

		$localized_data = apply_filters(
			'wp_ai_blogger_localized_admin_data',
			[
				'ajax_url'           => admin_url( 'admin-ajax.php' ),
				'rest_url'           => rest_url( WP_AI_BLOGGER_SLUG . '/v1/' ),
				'version'            => WP_AI_BLOGGER_VERSION,
				'upgrade_link'       => defined( 'WP_AI_BLOGGER_UPGRADE_LINK' ) ? esc_url( WP_AI_BLOGGER_UPGRADE_LINK ) : '',
				'admin_nonce'        => wp_create_nonce( 'wpaib_admin_nonce' ),
				'rest_nonce'         => wp_create_nonce( 'wp_rest' ),
				'admin_page_nonce'   => wp_create_nonce( 'wp_ai_blogger_admin_page' ),
				'userOnboarded'      => (bool) Helper::get_option( 'userOnboarded', false ),
				'admin_base_url'     => esc_url( admin_url( 'edit.php' ) ),
				'admin_app_url'      => esc_url( admin_url( 'edit.php?page=' . self::PAGE_ID ) ),
				'home_slug'          => sanitize_key( self::PAGE_ID ),
				'current_user_name'  => sanitize_text_field( wpaib_get_user_detail( 'name' ) ),
				'current_user_email' => sanitize_email( wpaib_get_user_detail( 'email' ) ),
				'current_user_id'    => get_current_user_id(),
				'pro_available'      => defined( 'WP_AI_BLOGGER_PRO_VERSION' ),
				'pro_version'        => defined( 'WP_AI_BLOGGER_PRO_VERSION' ) ? WP_AI_BLOGGER_PRO_VERSION : '',
				'pro_purchase_url'   => esc_url( 'https://wpaiblogger.com/' ),
				'licensing_nonce'    => wp_create_nonce( 'wp_ai_blogger_licensing_nonce' ),
				'license_status'     => $license_status,
				'admin_email'        => $admin_site_email_address,
				'site_title'         => $site_title,
				'site_description'   => $site_description,
				'site_for'           => $site_for,
				'post_ideas'         => $post_ideas,
				'token_total'        => $token_total,
				'token_remaining'    => $token_remaining,
				'license'            => $license,
				'temperature'        => $temperature,
				'harassment'         => $harassment,
				'hate'               => $hate,
				'sexually_explicit'  => $sexually_explicit,
				'dangerous_content'  => $dangerous_content,
				'blog_name'          => $blog_name,
				'post_statuses'      => $post_statuses,
				'categories'         => $categories,
				'tags'               => $tags,
				'authors'            => $authors,
				'post_types'         => $post_types,
				'postmeta_defaults'  => $postmeta_defaults,
				'all_campaigns'      => $all_campaigns,
				'generated_posts'    => $generated_posts,
				'edit_post_link'     => esc_url( add_query_arg(
					[
						'post'   => '{{POST_ID}}',
						'action' => 'edit',
					],
					admin_url( 'post.php' )
				) ),
				'security_level'     => 'enhanced',
			]
		);

		// Debug logging in development
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'WP AI Blogger License Debug: ' . print_r( $license, true ) );
			error_log( 'WP AI Blogger Localized Data: ' . print_r( $localized_data, true ) );
		}

		$handle = 'wp_ai_auto_blogger_admin_scripts';
		$build_path = WP_AI_BLOGGER_BASE_URL . 'assets/build/';
		$script_asset_path = WP_AI_BLOGGER_DIR . 'assets/build/blog-app.asset.php';

		// Validate script file exists
		if ( ! file_exists( $script_asset_path ) ) {
			return;
		}

		$script_info = include $script_asset_path;

		// Validate script info structure
		if ( ! is_array( $script_info ) || ! isset( $script_info['dependencies'] ) ) {
			return;
		}

		$script_dep = array_merge( $script_info['dependencies'], [] );

		// Validate script file exists
		$script_file = $build_path . 'blog-app.js';
		if ( ! $this->validate_script_file( WP_AI_BLOGGER_DIR . 'assets/build/blog-app.js' ) ) {
			return;
		}

		wp_enqueue_script(
			$handle,
			$script_file,
			$script_dep,
			WP_AI_BLOGGER_VERSION,
			true
		);

		wp_localize_script( $handle, 'wpaib_localized_data', $localized_data );

		wp_set_script_translations( $handle, 'wp-ai-blogger', WP_AI_BLOGGER_DIR . 'languages' );

		// Validate and enqueue styles
		$style_file = is_rtl() ? $build_path . 'blog-app-rtl.css' : $build_path . 'blog-app.css';
		$style_path = is_rtl() ? WP_AI_BLOGGER_DIR . 'assets/build/blog-app-rtl.css' : WP_AI_BLOGGER_DIR . 'assets/build/blog-app.css';

		if ( $this->validate_style_file( $style_path ) ) {
			wp_enqueue_style( $handle, $style_file, [], WP_AI_BLOGGER_VERSION );
		}
	}

	/**
	 * Validates security input parameters
	 *
	 * @since 1.0.0
	 * @param array $data Input data to validate
	 * @return array Validated data
	 */
	private function validate_security_input( array $data ): array {
		$validated = [];

		// Validate page parameter
		if ( isset( $data['page'] ) ) {
			$validated['page'] = sanitize_key( $data['page'] );
		}

		// Validate action parameter
		if ( isset( $data['action'] ) ) {
			$validated['action'] = sanitize_key( $data['action'] );
		}

		// Validate tab parameter
		if ( isset( $data['tab'] ) ) {
			$validated['tab'] = sanitize_key( $data['tab'] );
		}

		return $validated;
	}

	/**
	 * Sanitizes license data
	 *
	 * @since 1.0.0
	 * @param array $license License data
	 * @return array Sanitized license data
	 */
	private function sanitize_license_data( $license ): array {
		if ( ! is_array( $license ) ) {
			return [];
		}

		$sanitized = [];
		$allowed_keys = [ 'key', 'status', 'expires', 'sites_allowed', 'activations_left' ];

		foreach ( $allowed_keys as $key ) {
			if ( isset( $license[ $key ] ) ) {
				switch ( $key ) {
					case 'key':
						$sanitized[ $key ] = sanitize_text_field( $license[ $key ] );
						break;
					case 'status':
						$sanitized[ $key ] = sanitize_key( $license[ $key ] );
						break;
					case 'expires':
						$sanitized[ $key ] = sanitize_text_field( $license[ $key ] );
						break;
					case 'sites_allowed':
					case 'activations_left':
						$sanitized[ $key ] = absint( $license[ $key ] );
						break;
				}
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitizes post ideas data
	 *
	 * @since 1.0.0
	 * @param mixed $post_ideas Post ideas data
	 * @return array Sanitized post ideas
	 */
	private function sanitize_post_ideas( $post_ideas ): array {
		if ( ! is_array( $post_ideas ) ) {
			return [];
		}

		$sanitized = [];
		foreach ( $post_ideas as $idea ) {
			if ( is_string( $idea ) ) {
				$sanitized[] = sanitize_textarea_field( $idea );
			}
		}

		return array_slice( $sanitized, 0, 50 ); // Limit to 50 ideas
	}

	/**
	 * Gets sanitized post statuses
	 *
	 * @since 1.0.0
	 * @return array Sanitized post statuses
	 */
	private function get_sanitized_post_statuses(): array {
		$statuses = wpaib_get_post_statuses();
		if ( ! is_array( $statuses ) ) {
			return [];
		}

		$sanitized = [];
		foreach ( $statuses as $key => $label ) {
			$sanitized[ sanitize_key( $key ) ] = sanitize_text_field( $label );
		}

		return $sanitized;
	}

	/**
	 * Gets sanitized categories
	 *
	 * @since 1.0.0
	 * @return array Sanitized categories
	 */
	private function get_sanitized_categories(): array {
		$categories = wpaib_get_categories();
		if ( ! is_array( $categories ) ) {
			return [];
		}

		$sanitized = [];
		foreach ( $categories as $category ) {
			if ( isset( $category['id'], $category['name'] ) ) {
				$sanitized[] = [
					'id'   => absint( $category['id'] ),
					'name' => sanitize_text_field( $category['name'] ),
				];
			}
		}

		return $sanitized;
	}

	/**
	 * Gets sanitized tags
	 *
	 * @since 1.0.0
	 * @return array Sanitized tags
	 */
	private function get_sanitized_tags(): array {
		$tags = wpaib_get_tags();
		if ( ! is_array( $tags ) ) {
			return [];
		}

		$sanitized = [];
		foreach ( $tags as $tag ) {
			if ( isset( $tag['id'], $tag['name'] ) ) {
				$sanitized[] = [
					'id'   => absint( $tag['id'] ),
					'name' => sanitize_text_field( $tag['name'] ),
				];
			}
		}

		return $sanitized;
	}

	/**
	 * Gets sanitized authors
	 *
	 * @since 1.0.0
	 * @return array Sanitized authors
	 */
	private function get_sanitized_authors(): array {
		$authors = wpaib_get_authors();
		if ( ! is_array( $authors ) ) {
			return [];
		}

		$sanitized = [];
		foreach ( $authors as $author ) {
			if ( isset( $author['id'], $author['name'] ) ) {
				$sanitized[] = [
					'id'   => absint( $author['id'] ),
					'name' => sanitize_text_field( $author['name'] ),
				];
			}
		}

		return $sanitized;
	}

	/**
	 * Gets sanitized post types
	 *
	 * @since 1.0.0
	 * @return array Sanitized post types
	 */
	private function get_sanitized_post_types(): array {
		$post_types = wpaib_get_post_types();
		if ( ! is_array( $post_types ) ) {
			return [];
		}

		$sanitized = [];
		foreach ( $post_types as $key => $label ) {
			$sanitized[ sanitize_key( $key ) ] = sanitize_text_field( $label );
		}

		return $sanitized;
	}

	/**
	 * Sanitizes metadata defaults
	 *
	 * @since 1.0.0
	 * @param array $defaults Metadata defaults
	 * @return array Sanitized defaults
	 */
	private function sanitize_metadata_defaults( array $defaults ): array {
		$sanitized = [];
		$allowed_keys = [ 'title', 'content', 'excerpt', 'status', 'categories', 'tags', 'author' ];

		foreach ( $allowed_keys as $key ) {
			if ( isset( $defaults[ $key ] ) ) {
				switch ( $key ) {
					case 'title':
					case 'excerpt':
						$sanitized[ $key ] = sanitize_text_field( $defaults[ $key ] );
						break;
					case 'content':
						$sanitized[ $key ] = wp_kses_post( $defaults[ $key ] );
						break;
					case 'status':
						$sanitized[ $key ] = sanitize_key( $defaults[ $key ] );
						break;
					case 'categories':
					case 'tags':
						if ( is_array( $defaults[ $key ] ) ) {
							$sanitized[ $key ] = array_map( 'absint', $defaults[ $key ] );
						}
						break;
					case 'author':
						$sanitized[ $key ] = absint( $defaults[ $key ] );
						break;
				}
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitizes campaigns data
	 *
	 * @since 1.0.0
	 * @param array $campaigns Campaigns data
	 * @return array Sanitized campaigns
	 */
	private function sanitize_campaigns_data( array $campaigns ): array {
		$sanitized = [];

		foreach ( $campaigns as $campaign ) {
			if ( ! is_array( $campaign ) ) {
				continue;
			}

			$sanitized_campaign = [];
			$allowed_keys = [ 'id', 'title', 'description', 'status', 'created_at', 'updated_at', 'post_count' ];

			foreach ( $allowed_keys as $key ) {
				if ( isset( $campaign[ $key ] ) ) {
					switch ( $key ) {
						case 'id':
						case 'post_count':
							$sanitized_campaign[ $key ] = absint( $campaign[ $key ] );
							break;
						case 'title':
							$sanitized_campaign[ $key ] = sanitize_text_field( $campaign[ $key ] );
							break;
						case 'description':
							$sanitized_campaign[ $key ] = sanitize_textarea_field( $campaign[ $key ] );
							break;
						case 'status':
							$sanitized_campaign[ $key ] = sanitize_key( $campaign[ $key ] );
							break;
						case 'created_at':
						case 'updated_at':
							$sanitized_campaign[ $key ] = sanitize_text_field( $campaign[ $key ] );
							break;
					}
				}
			}

			if ( ! empty( $sanitized_campaign ) ) {
				$sanitized[] = $sanitized_campaign;
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitizes posts data
	 *
	 * @since 1.0.0
	 * @param array $posts Posts data
	 * @return array Sanitized posts
	 */
	private function sanitize_posts_data( array $posts ): array {
		$sanitized = [];

		foreach ( $posts as $post ) {
			if ( ! is_array( $post ) ) {
				continue;
			}

			$sanitized_post = [];
			$allowed_keys = [ 'id', 'title', 'status', 'created_at', 'updated_at', 'author_id', 'campaign_id' ];

			foreach ( $allowed_keys as $key ) {
				if ( isset( $post[ $key ] ) ) {
					switch ( $key ) {
						case 'id':
						case 'author_id':
						case 'campaign_id':
							$sanitized_post[ $key ] = absint( $post[ $key ] );
							break;
						case 'title':
							$sanitized_post[ $key ] = sanitize_text_field( $post[ $key ] );
							break;
						case 'status':
							$sanitized_post[ $key ] = sanitize_key( $post[ $key ] );
							break;
						case 'created_at':
						case 'updated_at':
							$sanitized_post[ $key ] = sanitize_text_field( $post[ $key ] );
							break;
					}
				}
			}

			if ( ! empty( $sanitized_post ) ) {
				$sanitized[] = $sanitized_post;
			}
		}

		return $sanitized;
	}

	/**
	 * Validates script file
	 *
	 * @since 1.0.0
	 * @param string $file_path File path to validate
	 * @return bool True if valid
	 */
	private function validate_script_file( string $file_path ): bool {
		if ( ! file_exists( $file_path ) ) {
			return false;
		}

		$file_info = pathinfo( $file_path );
		if ( ! isset( $file_info['extension'] ) || $file_info['extension'] !== 'js' ) {
			return false;
		}

		// Check file size (max 5MB)
		if ( filesize( $file_path ) > 5 * 1024 * 1024 ) {
			return false;
		}

		return true;
	}

	/**
	 * Validates style file
	 *
	 * @since 1.0.0
	 * @param string $file_path File path to validate
	 * @return bool True if valid
	 */
	private function validate_style_file( string $file_path ): bool {
		if ( ! file_exists( $file_path ) ) {
			return false;
		}

		$file_info = pathinfo( $file_path );
		if ( ! isset( $file_info['extension'] ) || $file_info['extension'] !== 'css' ) {
			return false;
		}

		// Check file size (max 2MB)
		if ( filesize( $file_path ) > 2 * 1024 * 1024 ) {
			return false;
		}

		return true;
	}

	/**
	 * Function to load the admin area actions.
	 *
	 * @since 1.0.0
	 */
	public function initialize_hooks(): void {
		add_action( 'admin_menu', [ $this, 'register_plugin_menus' ] );
	}

	/**
	 * Add submenu to admin menu.
	 *
	 * @since 1.0.0
	 */
	public function register_plugin_menus(): void {
		if ( current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
			add_submenu_page(
				'edit.php',
				__( 'AI Blogger', 'wp-ai-blogger' ),
				__( 'AI Blogger', 'wp-ai-blogger' ),
				WP_AI_BLOGGER_CAPABILITY,
				self::PAGE_ID,
				[ $this, 'render_settings_page' ]
			);
		}
	}
}


