<?php
/**
 * Loader.
 *
 * @package WPAIBlogger
 * @since x.x.x
 */

namespace WPAIBlogger;

use WPAIBlogger\Admin\Ajax;
use WPAIBlogger\Admin\API;
use WPAIBlogger\Admin\Filters;
use WPAIBlogger\Admin\Licensing;
use WPAIBlogger\Admin\Menu;
use WPAIBlogger\Core\CPT;
use WPAIBlogger\Core\Editor;
use WPAIBlogger\Core\Frontend;
use WPAIBlogger\Core\Maintenance;
use WPAIBlogger\Core\Scheduler;

defined( 'ABSPATH' ) || exit;

/**
 * Plugin_Loader
 *
 * @since x.x.x
 */
class Loader {
	/**
	 * Instance
	 *
	 * @access private
	 * @var object Class Instance.
	 * @since x.x.x
	 */
	private static $instance;

	/**
	 * Constructor
	 *
	 * @since x.x.x
	 */
	public function __construct() {
		spl_autoload_register( [ $this, 'autoload' ] );

		// Activation hook.
		register_activation_hook( WP_AI_BLOGGER_FILE, [ $this, 'activation_actions' ] );

		// Deactivation hook.
		register_deactivation_hook( WP_AI_BLOGGER_FILE, [ $this, 'deactivation_actions' ] );

		add_action( 'plugins_loaded', [ $this, 'setup' ], 1 );

		// Remove this after the translation error is fixed.
		add_filter( 'doing_it_wrong_trigger_error', [ $this, 'suppress_translation_error' ], 10, 4 );
	}

	/**
	 * Enqueue required setup after plugins loaded.
	 *
	 * @since x.x.x
	 * @return void
	 */
	public function setup(): void {

		/* Maintenance init */
		Maintenance::get_instance();

		/* Scheduler init */
		Scheduler::get_instance();

		/* API init */
		API::get_instance();

		/* CPT init */
		CPT::get_instance();

		/* Load Editor Support */
		Editor::get_instance();

		if ( is_admin() ) {
			/* Ajax init */
			Ajax::get_instance();

			/* Filters init */
			Filters::get_instance();

			/* Licensing */
			Licensing::get_instance();

			/* Admin Menu init */
			Menu::get_instance();
		} else {
			// Load Frontend Support.
			Frontend::get_instance();
		}
	}

	/**
	 * Suppress translation error.
	 *
	 * @param bool   $status       Status.
	 * @param string $function_name Function name.
	 * @param string $message      Message.
	 * @param string $version      Version.
	 *
	 * @return bool
	 */
	public function suppress_translation_error( $status, $function_name, $message, $version ) {
		if ( $function_name === '_load_textdomain_just_in_time' && strpos( $message, 'wp-ai-blogger' ) !== false ) {
			return false;
		}
		return $status;
	}

	/**
	 * Initiator
	 *
	 * @since x.x.x
	 * @return object initialized object of class.
	 */
	public static function get_instance() {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Autoload classes.
	 *
	 * @param string $class class name.
	 * @return void
	 */
	public function autoload( $class ): void {
		if ( strpos( $class, __NAMESPACE__ ) !== 0 ) {
			return;
		}

		$class_to_load = $class;

		$filename = preg_replace(
			[ '/^' . __NAMESPACE__ . '\\\/', '/([a-z])([A-Z])/', '/_/', '/\\\/' ],
			[ '', '$1-$2', '-', DIRECTORY_SEPARATOR ],
			$class_to_load
		);

		if ( is_string( $filename ) ) {
			$filename = strtolower( $filename );

			$file = WP_AI_BLOGGER_DIR . $filename . '.php';

			// if the file readable, include it.
			if ( is_readable( $file ) ) {
				require_once $file;
			}
		}
	}

	/**
	 * Plugin Activation actions.
	 *
	 * @since x.x.x
	 */
	public function activation_actions(): void {
	}

	/**
	 * Plugin Deactivation actions.
	 *
	 * @since x.x.x
	 */
	public function deactivation_actions(): void {
	}
}

/**
 * Kicking this off by calling 'get_instance()' method
 */
Loader::get_instance();
