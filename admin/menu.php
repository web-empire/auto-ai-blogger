<?php
/**
 * Admin Menu.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace AutoBlogAI\Admin;

use AutoBlogAI\Inc\Traits\Get_Instance;
use AutoBlogAI\Inc\Utils\Helper;

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
				function () {
					return ''; // Return an empty string to remove the text.
				}
			);

			add_filter(
				'update_footer',
				function () {
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

		$site_title               = Helper::get_option( 'siteTitle' );
		$site_description         = Helper::get_option( 'siteDescription' );
		$site_for                 = Helper::get_option( 'siteFor' );
		$admin_site_email_address = get_option( 'admin_email' );
		$temperature              = Helper::get_option( 'temperature' );
		$harassment               = Helper::get_option( 'harassment' );
		$hate                     = Helper::get_option( 'hate' );
		$sexually_explicit        = Helper::get_option( 'sexually_explicit' );
		$dangerous_content        = Helper::get_option( 'dangerous_content' );
		$civic_integrity          = Helper::get_option( 'civic_integrity' );
		$post_ideas               = Helper::get_option( 'postIdeas' );

		$license = get_option( 'wpaiblogger_license_options' );

		$license = isset( $license['sc_license_key'] ) && ! empty( $license['sc_license_key'] ) ? $license['sc_license_key'] : '';

		$localized_data = apply_filters(
			'autoblog_ai_localized_admin_data',
			[
				'ajax_url'          => admin_url( 'admin-ajax.php' ),
				'version'           => WP_AI_BLOGGER_VERSION,
				'upgrade_link'      => WP_AI_BLOGGER_UPGRADE_LINK,
				'admin_nonce'       => wp_create_nonce( 'wpaib_update_admin_setting' ),
				'userOnboarded'     => get_option( 'autoblog_ai_userOnboarded', false ),
				'admin_base_url'    => admin_url( 'edit.php' ),
				'admin_app_url'     => 'wp-admin/edit.php?page=' . self::PAGE_ID,
				'home_slug'         => self::PAGE_ID,
				'pro_available'     => defined( 'WP_AI_BLOGGER_PRO_VERSION' ) ? true : false,
				'pro_version'       => defined( 'WP_AI_BLOGGER_PRO_VERSION' ) ? WP_AI_BLOGGER_PRO_VERSION : '',
				'pro_purchase_url'  => 'https://wpaiblogger.com/',
				'licensing_nonce'   => wp_create_nonce( 'autoblog_ai_licensing_nonce' ),
				'license_status'    => get_option( 'autoblog_ai_license_status', 'unlicensed' ),
				'admin_email'       => $admin_site_email_address,
				'site_title'        => $site_title,
				'site_description'  => $site_description,
				'site_for'          => $site_for,
				'post_ideas'        => $post_ideas,
				'license'           => $license,
				'temperature'       => $temperature,
				'harassment'        => $harassment,
				'hate'              => $hate,
				'sexually_explicit' => $sexually_explicit,
				'dangerous_content' => $dangerous_content,
				'civic_integrity'   => $civic_integrity,
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
