<?php
/**
 * Admin Menu.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace WPAIBlogger\Admin;

use FluentCommunity\App\Models\Meta;
use WPAIBlogger\Inc\Utils\Metadata;
use WPAIBlogger\Inc\Traits\Get_Instance;

/**
 * Frontend Compatibility
 *
 * @package AutoBlog_AI
 */

/**
 * Menu setup
 *
 * @since x.x.x
 */
class Menu {
	use Get_Instance;

	/**
	 * Settings page ID for Plugin settings.
	 */
	public const PAGE_ID = WP_AI_BLOGGER_SLUG;

	/**
	 * Constructor
	 *
	 * @since x.x.x
	 *
	 * @return void
	 */
	public function __construct() {
		$this->initialize_hooks();

		add_action( 'admin_init', [ $this, 'settings_admin_scripts' ] );
	}

	/**
	 * Initialize Admin Setup.
	 *
	 * @since x.x.x
	 */
	public function settings_admin_scripts(): void {
		if ( ! empty( $_GET['page'] ) && ( wp_unslash( $_GET['page'] ) === self::PAGE_ID || strpos( sanitize_text_field( wp_unslash( $_GET['page'] ) ), self::PAGE_ID . '_' ) !== false ) ) { // phpcs:ignore -- Input var okay.
			add_action( 'admin_enqueue_scripts', [ $this, 'app_build_scripts' ] );

			add_filter(
				'admin_footer_text',
				static function () {
					return ''; // Return an empty string to remove the text.
				}
			);

			add_filter(
				'update_footer',
				static function () {
					return ''; // Return an empty string to remove the text.
				}
			);
		}
	}

	/**
	 * Renders the hub screen canvas.
	 *
	 * @since x.x.x
	 */
	public function render_settings_page(): void {
		echo "<div id='autoblog-main-page--wrapper'></div>";
	}

	/**
	 * Enqueue the Admin's build files for plugin to work.
	 *
	 * @since x.x.x
	 */
	public function app_build_scripts(): void {
		if ( is_customize_preview() ) {
			return;
		}

		$blog_name                = get_bloginfo( 'name' );
		$admin_site_email_address = get_option( 'admin_email' );

		$localized_data = apply_filters(
			'wp_ai_blogger_localized_admin_data',
			[
				'ajax_url'           => admin_url( 'admin-ajax.php' ),
				'version'            => WP_AI_BLOGGER_VERSION,
				'upgrade_link'       => WP_AI_BLOGGER_UPGRADE_LINK,
				'admin_nonce'        => wp_create_nonce( 'wpaib_admin_nonce' ),
				'userOnboarded'      => get_option( 'autoblog_ai_userOnboarded', false ),
				'admin_base_url'     => admin_url( 'edit.php' ),
				'admin_app_url'      => 'wp-admin/edit.php?page=' . self::PAGE_ID,
				'home_slug'          => self::PAGE_ID,
				'current_user_name'  => wpaib_get_user_detail( 'name' ),
				'current_user_email' => wpaib_get_user_detail( 'email' ),
				'pro_available'      => defined( 'WP_AI_BLOGGER_PRO_VERSION' ) ? true : false,
				'pro_version'        => defined( 'WP_AI_BLOGGER_PRO_VERSION' ) ? WP_AI_BLOGGER_PRO_VERSION : '',
				'pro_purchase_url'   => 'https://wpaiblogger.com/',
				'licensing_nonce'    => wp_create_nonce( 'autoblog_ai_licensing_nonce' ),
				'license_status'     => get_option( 'autoblog_ai_license_status', 'unlicensed' ),
				'admin_email'        => $admin_site_email_address,
				'blog_name'          => $blog_name,
				'post_statuses'      => wpaib_get_post_statuses(),
				'categories'         => wpaib_get_categories(),
				'tags'               => wpaib_get_tags(),
				'authors'            => wpaib_get_authors(),
				'post_types'         => wpaib_get_post_types(),
				'postmeta_defaults'  => Metadata::get_default_settings(),
				'all_campaigns'      => wpaib_get_all_campaigns(),
			]
		);

		$handle            = 'wp_ai_auto_blogger_admin_scripts';
		$build_path        = WP_AI_BLOGGER_BASE_URL . 'assets/build/';
		$script_asset_path = WP_AI_BLOGGER_DIR . 'assets/build/blog-app.asset.php';

		$script_info = file_exists( $script_asset_path )
			? include $script_asset_path
			: [
				'dependencies' => [],
				'version'      => WP_AI_BLOGGER_VERSION,
			];

		$script_dep = array_merge( $script_info['dependencies'], [] );

		wp_enqueue_script(
			$handle,
			$build_path . 'blog-app.js',
			$script_dep,
			WP_AI_BLOGGER_VERSION,
			true
		);

		wp_localize_script( $handle, 'autoblog_data', $localized_data );

		wp_set_script_translations( $handle, 'wp-ai-blogger', WP_AI_BLOGGER_DIR . 'languages' );

		wp_enqueue_style( $handle, is_rtl() ? $build_path . 'blog-app-rtl.css' : $build_path . 'blog-app.css', [], WP_AI_BLOGGER_VERSION );
	}

	/**
	 * Function to load the admin area actions.
	 *
	 * @since x.x.x
	 */
	public function initialize_hooks(): void {
		add_action( 'admin_menu', [ $this, 'register_plugin_menus' ] );
	}

	/**
	 * Add submenu to admin menu.
	 *
	 * @since x.x.x
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
