<?php
/**
 * Admin Init.
 *
 * @package wp-ai-blogger
 * @since x.x.x
 */

namespace AutoBlogAI\Admin;

use AutoBlogAI\Inc\Traits\Get_Instance;
use AutoBlogAI\Inc\Utils\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Initialize setup
 *
 * @since x.x.x
 * @package wp-ai-blogger
 */

defined( 'ABSPATH' ) || exit;

/**
 * This class setup admin init
 *
 * @class API
 */
class API extends \WP_REST_Controller {
	use Get_Instance;

	/**
	 * Namespace.
	 *
	 * @var string
	 */
	protected $namespace = WP_AI_BLOGGER_SLUG . '/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = '/admin/settings/';

	/**
	 * Option name
	 *
	 * @access private
	 * @var string $option_name DB option name.
	 * @since x.x.x
	 */
	private static $option_name = WP_AI_BLOGGER_DB_OPTION;

	/**
	 * Admin settings dataset
	 *
	 * @access private
	 * @var array $ai_blogger_admin_settings Settings array.
	 * @since x.x.x
	 */
	private static $ai_blogger_admin_settings = [];

	/**
	 * Constructor
	 *
	 * @since x.x.x
	 */
	public function __construct() {
		self::$ai_blogger_admin_settings = get_option( self::$option_name, [] );
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register API routes.
	 *
	 * @since x.x.x
	 */
	public function register_routes(): void {

		register_rest_route(
			$this->namespace,
			$this->rest_base,
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_admin_settings' ],
					'permission_callback' => [ $this, 'get_permissions_check' ],
					'args'                => [],
				],
				'schema' => [ $this, 'get_public_item_schema' ],
			]
		);
	}

	/**
	 * Get common settings.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return array $updated_option defaults + set DB option data.
	 *
	 * @since x.x.x
	 */
	public function get_admin_settings( $request ) {
		return Settings::get_ai_blogger_settings();
	}

	/**
	 * Check whether a given request has permission to read notes.
	 *
	 * @param  WP_REST_Request $request Full details about the request.
	 * @return WP_Error|bool
	 * @since x.x.x
	 */
	public function get_permissions_check( $request ) {

		if ( ! current_user_can( WP_AI_BLOGGER_CAPABILITY ) ) {
			return new \WP_Error( 'wp_ai_blogger_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'wp-ai-blogger' ), [ 'status' => rest_authorization_required_code() ] );
		}

		return true;
	}
}
