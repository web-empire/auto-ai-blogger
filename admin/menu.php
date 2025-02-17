<?php
/**
 * Admin Menu.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace AutoBlogAI\Admin;

use AutoBlogAI\Inc\Traits\Get_Instance;
use AutoBlogAI\Inc\Utils\Settings;

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
	public const PAGE_ID = 'autoblog-ai';

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

		$localized_data = apply_filters(
			'wpdh_localized_admin_data',
			[
				'ajax_url'     => admin_url( 'admin-ajax.php' ),
				'version'      => WP_AUTOBLOG_AI_VERSION,
				'upgrade_link' => WP_AUTOBLOG_AI_UPGRADE_LINK,
				'nonce'        => wp_create_nonce( 'autoblog-ai' ),
			]
		);

		$handle            = 'hub_admin_scripts';
		$build_path        = WP_AUTOBLOG_AI_BASE_URL . 'assets/build/';
		$script_asset_path = WP_AUTOBLOG_AI_DIR . 'assets/build/blog-app.asset.php';

		$script_info = file_exists( $script_asset_path )
			? include $script_asset_path
			: [
				'dependencies' => [],
				'version'      => WP_AUTOBLOG_AI_VERSION,
			];

		$script_dep = array_merge( $script_info['dependencies'], [] );

		wp_enqueue_script(
			$handle,
			$build_path . 'blog-app.js',
			$script_dep,
			WP_AUTOBLOG_AI_VERSION,
			true
		);

		wp_localize_script( $handle, 'autoblog_data', $localized_data );

		wp_set_script_translations( $handle, 'autoblog-ai', WP_AUTOBLOG_AI_DIR . 'languages' );

		wp_enqueue_style( $handle, is_rtl() ? $build_path . 'blog-app-rtl.css' : $build_path . 'blog-app.css', [], WP_AUTOBLOG_AI_VERSION );
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
		if ( current_user_can( WP_AUTOBLOG_AI_CAPABILITY ) ) {
			add_submenu_page(
				'options-general.php',
				__( 'AutoBlog Ai', 'autoblog-ai' ),
				__( 'AutoBlog Ai', 'autoblog-ai' ),
				WP_AUTOBLOG_AI_CAPABILITY,
				self::PAGE_ID,
				[ $this, 'render_settings_page' ]
			);
		}
	}
}
