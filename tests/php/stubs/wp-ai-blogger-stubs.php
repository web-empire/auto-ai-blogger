<?php

namespace WPAIBlogger {
    /**
     * Plugin_Loader
     *
     * @since x.x.x
     */
    class Loader
    {
        /**
         * Constructor
         *
         * @since x.x.x
         */
        public function __construct()
        {
        }
        /**
         * Enqueue required setup after plugins loaded.
         *
         * @since x.x.x
         * @return void
         */
        public function setup() : void
        {
        }
        /**
         * Initiator
         *
         * @since x.x.x
         * @return object initialized object of class.
         */
        public static function get_instance()
        {
        }
        /**
         * Autoload classes.
         *
         * @param string $class class name.
         * @return void
         */
        public function autoload($class) : void
        {
        }
        /**
         * Plugin Activation actions.
         *
         * @since x.x.x
         */
        public function activation_actions() : void
        {
        }
        /**
         * Plugin Deactivation actions.
         *
         * @since x.x.x
         */
        public function deactivation_actions() : void
        {
        }
    }
}
namespace {
    /**
     * Web_Notices
     *
     * @since 1.0.0
     */
    class Web_Notices
    {
        /**
         * Constructor
         *
         * @since 1.0.0
         */
        public function __construct()
        {
        }
        /**
         * Filters and Returns a list of allowed tags and attributes for a given context.
         *
         * @param array  $allowedposttags array of allowed tags.
         * @param string $context Context type (explicit).
         * @since 1.0.0
         * @return array
         */
        public function add_data_attributes($allowedposttags, $context)
        {
        }
        /**
         * Add Notice.
         *
         * @since 1.0.0
         * @param array $args Notice arguments.
         * @return void
         */
        public static function add_notice($args = []) : void
        {
        }
        /**
         * Dismiss Notice.
         *
         * @since 1.0.0
         * @return void
         */
        public function dismiss_notice() : void
        {
        }
        /**
         * Enqueue Scripts.
         *
         * @since 1.0.0
         * @return void
         */
        public function enqueue_scripts() : void
        {
        }
        /**
         * Sort the notices based on the given priority of the notice.
         * This function is called from usort()
         *
         * @since 1.5.2
         * @param array $notice_1 First notice.
         * @param array $notice_2 Second Notice.
         * @return array
         */
        public function sort_notices($notice_1, $notice_2)
        {
        }
        /**
         * Display the notices in the WordPress admin.
         *
         * @since 1.0.0
         * @return void
         */
        public function show_notices() : void
        {
        }
        /**
         * Render a notice.
         *
         * @since 1.0.0
         * @param  array $notice Notice markup.
         * @return void
         */
        public static function markup($notice = []) : void
        {
        }
        /**
         * Get base URL for the web-notices.
         *
         * @return mixed URL.
         */
        public static function get_url()
        {
        }
    }
}
namespace WPAIBlogger\Inc\Traits {
    /**
     * Trait Get_Instance.
     *
     * @since x.x.x
     */
    trait Get_Instance
    {
        /**
         * Instance object.
         *
         * @var object Class Instance.
         */
        private static $instance = null;
        /**
         * Initiator
         *
         * @since x.x.x
         * @return object initialized object of class.
         */
        public static function get_instance()
        {
        }
    }
}
namespace WPAIBlogger\Inc\Utils {
    /**
     * This class will holds the code related to the managing of settings of the plugin.
     *
     * @class Settings
     */
    class Settings
    {
        /**
         * Cache the DB options
         *
         * @since x.x.x
         * @access public
         * @var array
         */
        public static $dashboard_options = [];
        /**
         * Returns all default dashboard settings.
         *
         * @return array
         * @since x.x.x
         */
        public static function get_settings_dataset()
        {
        }
        /**
         * Returns an option from the default options.
         *
         * @param  string $key     The option key.
         * @param  mixed  $default Option default value if option is not available.
         * @return mixed   Returns the option value
         *
         * @since x.x.x
         */
        public static function get_default_option($key, $default = false)
        {
        }
        /**
         * As per the settings dataset, return the default settings.
         *
         * @return array
         * @since x.x.x
         */
        public static function get_default_settings()
        {
        }
        /**
         * Returns all portal settings.
         *
         * @return array
         * @since x.x.x
         */
        public static function get_ai_blogger_settings()
        {
        }
        /**
         * Get all the settings type wise.
         *
         * @return array
         * @since x.x.x
         */
        public static function get_all_type_wise_settings()
        {
        }
        /**
         * Data cleaner
         *
         * @since x.x.x
         * @access public
         *
         * @param mixed  $value     data from AJAX.
         * @param string $data_type datatype to sanitize further.
         *
         * @return mixed Sanitized data.
         */
        public static function sanitize_data($value, $data_type = 'default')
        {
        }
        /**
         * Get the type of the setting.
         *
         * @param string $key The setting key.
         * @return string
         * @since x.x.x
         */
        public static function get_setting_type($key)
        {
        }
    }
    /**
     * This class will holds the code related to the managing of settings of the plugin.
     *
     * @class Metadata
     */
    class Metadata
    {
        /**
         * Cache the DB options
         *
         * @since x.x.x
         * @access public
         * @var array
         */
        public static $dashboard_options = [];
        /**
         * Returns all default post settings.
         *
         * @return array
         * @since x.x.x
         */
        public static function get_settings_dataset()
        {
        }
        /**
         * Returns the campaign meta value.
         *
         * @param int    $campaign_id The campaign ID.
         * @param string $key         The meta key.
         * @return string
         *
         * @since x.x.x
         */
        public static function get_campaign_meta($campaign_id, $key)
        {
        }
        /**
         * Update the campaign meta value.
         *
         * @param int    $campaign_id The campaign ID.
         * @param string $key         The meta key.
         * @param mixed  $value       The meta value.
         * @return bool
         *
         * @since x.x.x
         */
        public static function update_campaign_meta($campaign_id, $key, $value)
        {
        }
        /**
         * Returns an option from the default options.
         *
         * @param  string $key     The option key.
         * @param  mixed  $default Option default value if option is not available.
         * @return mixed   Returns the option value
         *
         * @since x.x.x
         */
        public static function get_default_option($key, $default = false)
        {
        }
        /**
         * As per the settings dataset, return the default settings.
         *
         * @return array
         * @since x.x.x
         */
        public static function get_default_settings()
        {
        }
        /**
         * Data cleaner
         *
         * @since x.x.x
         * @access public
         *
         * @param mixed  $value     data from AJAX.
         * @param string $data_type datatype to sanitize further.
         *
         * @return mixed Sanitized data.
         */
        public static function sanitize_data($value, $data_type = 'default')
        {
        }
        /**
         * Format post metadata in a way that it can be saved in the database via wp_insert_post.
         *
         * @param array $postdata The metadata to format.
         * @since x.x.x
         * @return array The formatted metadata.
         */
        public static function format_data($postdata)
        {
        }
        /**
         * Get all campaign metadata as per the settings dataset.
         *
         * @param int $post_id The post ID.
         * @return array<mixed> The metadata.
         * @since x.x.x
         */
        public static function get_metadata($post_id)
        {
        }
        /**
         * Get passed campaign post data.
         *
         * @param int  $post_id The post ID.
         * @param bool $plain_metadata Whether to return plain metadata.
         * @since 0.0.1
         * @return array|bool The campaign data or false if not found.
         */
        public static function get_campaign_data($post_id, $plain_metadata = false)
        {
        }
    }
    /**
     * This class setup all Helper functions.
     *
     * @class Helper
     */
    class Helper
    {
        /**
         * Returns an option from the database for the admin settings.
         *
         * @param  string $key     The option key.
         * @param  mixed  $default Option default value if option is not available.
         * @return mixed   Returns the option value
         *
         * @since x.x.x
         */
        public static function get_option($key, $default = false)
        {
        }
        /**
         * Update option from the database for the admin settings.
         *
         * @param  string $key      The option key.
         * @param  mixed  $value    Option value to update.
         * @return string           Return the option value
         *
         * @since x.x.x
         */
        public static function update_option($key, $value = true)
        {
        }
        /**
         * Delete option from the database for the admin settings.
         *
         * @param  string $key The option key.
         * @return void
         *
         * @since x.x.x
         */
        public static function delete_option($key) : void
        {
        }
    }
}
namespace SureCart\Licensing {
    /**
     * Activation model
     */
    class Activation
    {
        /**
         * The endpoint for the activations.
         *
         * @var string
         */
        protected $endpoint = 'v1/public/activations';
        /**
         * SureCart\Licensing\Client
         *
         * @var object
         */
        protected $client;
        /**
         * `option_name` of `wp_options` table
         *
         * @var string
         */
        protected $option_key;
        /**
         * Initialize the class.
         *
         * @param SureCart\Licensing\Client $client The client.
         */
        public function __construct(\SureCart\Licensing\Client $client)
        {
        }
        /**
         * Create an activation for the license.
         *
         * @param string $license_id The license id.
         *
         * @return object|\WP_Error
         */
        public function create($license_id)
        {
        }
        /**
         * Retrieves details of a specific activation.
         *
         * @param string $id The id of the activation.
         *
         * @return object|\WP_Error
         */
        public function get($id = '')
        {
        }
        /**
         * Update an activation for the license.
         *
         * @param string $id The id of the activation.
         *
         * @return object|\WP_Error
         */
        public function update($id = '')
        {
        }
        /**
         * Deletes a specific activation.
         *
         * @param string $id The id of the activation.
         *
         * @return object|\WP_Error
         */
        public function delete($id = '')
        {
        }
    }
    /**
     * The settings class.
     */
    class Settings
    {
        /**
         * SureCart\Licensing\Client
         *
         * @var object
         */
        protected $client;
        /**
         * Create the pages.
         *
         * @param SureCart\Licensing\Client $client The client.
         */
        public function __construct(\SureCart\Licensing\Client $client)
        {
        }
        /**
         * Set an option.
         *
         * @param string $name Name of option.
         *
         * @return mixed
         */
        public function __get($name)
        {
        }
        /**
         * Set an option
         *
         * @param string $name Name of option.
         * @param mixed  $value Value.
         *
         * @return bool
         */
        public function __set($name, $value)
        {
        }
        /**
         * Add the settings page.
         *
         * @param array $args Settings page args.
         *
         * @return void
         */
        public function add_page($args) : void
        {
        }
        /**
         * Set the option key.
         *
         * If someone wants to override the default generated key.
         *
         * @param string $key The option key.
         */
        public function set_option_key($key)
        {
        }
        /**
         * Add the admin menu
         *
         * @return void
         */
        public function admin_menu() : void
        {
        }
        /**
         * Get all options
         *
         * @return array
         */
        public function get_options()
        {
        }
        /**
         * Clear out the options.
         *
         * @return bool
         */
        public function clear_options()
        {
        }
        /**
         * Get a specific option
         *
         * @param string $name Option name.
         *
         * @return mixed
         */
        public function get_option($name)
        {
        }
        /**
         * Set the option.
         *
         * @param string $name The option name.
         * @param mixed  $value The option value.
         *
         * @return bool
         */
        public function set_option($name, $value)
        {
        }
        /**
         * The settings page menu output.
         *
         * @return void
         */
        public function settings_output() : void
        {
        }
        /**
         * Print the css for the form.
         *
         * @return void
         */
        public function print_css() : void
        {
        }
        /**
         * Get the activation.
         *
         * @return Object|false
         */
        public function get_activation()
        {
        }
        /**
         * License form submit
         */
        public function license_form_submit()
        {
        }
        /**
         * Redirect to a url client-side.
         * We need to do this to avoid "headers already sent" messages.
         *
         * @param string $url Url to redirect.
         *
         * @return void
         */
        public function redirect($url) : void
        {
        }
        /**
         * Add a notice.
         *
         * @param string $code Notice code.
         * @param string $message Notice message.
         * @param string $type Notice type.
         *
         * @return void
         */
        public function add_notice($code, $message, $type = 'info') : void
        {
        }
        /**
         * Add an error.
         *
         * @param string $code Error code.
         * @param string $message Error message.
         *
         * @return void
         */
        public function add_error($code, $message) : void
        {
        }
        /**
         * Add an success message
         *
         * @param string $code Success code.
         * @param string $message Success message.
         *
         * @return void
         */
        public function add_success($code, $message) : void
        {
        }
    }
    /**
     * License model
     */
    class License
    {
        /**
         * The endpoint for the licenses.
         *
         * @var string
         */
        protected $endpoint = 'v1/public/licenses';
        /**
         * SureCart\Licensing\Client
         *
         * @var object
         */
        protected $client;
        /**
         * Initialize the class.
         *
         * @param SureCart\Licensing\Client $client The client.
         */
        public function __construct(\SureCart\Licensing\Client $client)
        {
        }
        /**
         * Retrieve license information by key.
         *
         * @param string $license_key The license key.
         *
         * @return Object|\WP_Error
         */
        public function retrieve($license_key)
        {
        }
        /**
         * Activate a specific license key.
         *
         * @param string $key A license key.
         *
         * @return \WP_Error|Object
         * @throws \Exception If something goes wrong.
         */
        public function activate($key = '')
        {
        }
        /**
         * Deactivate a license.
         *
         * @param string $activation_id The activation id.
         *
         * @return \WP_Error|true
         */
        public function deactivate($activation_id = '')
        {
        }
        /**
         * Ge the current release
         *
         * @param int $expires_in The amount of time until it expires.
         *
         * @return Object|WP_Error
         */
        public function get_current_release($expires_in = 900)
        {
        }
        /**
         * Validate a license key.
         *
         * @param string $key The license key.
         * @param bool   $store Should we store the key and id.
         * @return Object
         * @throws \Exception If the license is not valid.
         */
        public function validate($key, $store = false)
        {
        }
        /**
         * Validate the current release.
         *
         * @return Object
         * @throws \Exception If the release is not valid.
         */
        public function validate_release()
        {
        }
        /**
         * Check this is a valid license.
         *
         * @param string $license_key The license key.
         *
         * @return bool|\WP_Error
         */
        public function is_valid($license_key = '')
        {
        }
        /**
         * Is this license active?
         *
         * @return bool
         */
        public function is_active()
        {
        }
        /**
         * Validate the license response
         *
         * @param Object|\WP_Error $license The license response.
         *
         * @return \WP_Error|bool
         */
        public function validate_license($license)
        {
        }
    }
    /**
     * This class will handle the updates.
     */
    class Updater
    {
        /**
         * SureCart\Licensing\Client.
         *
         * @var object
         */
        protected $client;
        // Declared as private.
        /**
         * Initialize the class.
         *
         * @param SureCart\Licensing\Client $client The client.
         */
        public function __construct(\SureCart\Licensing\Client $client)
        {
        }
        /**
         * Set up WordPress filter to hooks to get update.
         *
         * @return void
         */
        public function run_plugin_hooks() : void
        {
        }
        /**
         * Set up WordPress filter to hooks to get update.
         *
         * @return void
         */
        public function run_theme_hooks() : void
        {
        }
        /**
         * Check for Update for this specific project.
         *
         * @param Object $transient_data Transient data for update.
         */
        public function check_plugin_update($transient_data)
        {
        }
        /**
         * Updates information on the "View version x.x details" page with custom data.
         *
         * @param mixed  $data Plugin data.
         * @param string $action The action type.
         * @param object $args Arguments.
         *
         * @return object $data
         */
        public function plugins_api_filter($data, $action = '', $args = null)
        {
        }
        /**
         * Check theme update.
         *
         * @param Object $transient_data Transient data for the update.
         */
        public function check_theme_update($transient_data)
        {
        }
    }
    /**
     * SureCart Client
     *
     * This class is necessary to set project data
     */
    class Client
    {
        /**
         * The client version
         *
         * @var string
         */
        public $version = '1.0.2';
        /**
         * Name of the plugin
         *
         * @var string
         */
        public $name;
        /**
         * The plugin/theme file path
         *
         * @example .../wp-content/plugins/test-slug/test-slug.php
         *
         * @var string
         */
        public $file;
        /**
         * The public token for the store.
         *
         * @example pt_jzieNYQdE5LMAxksscgU6H4
         *
         * @var string
         */
        public $public_token;
        /**
         * Main plugin file
         *
         * @example test-slug/test-slug.php
         *
         * @var string
         */
        public $basename;
        /**
         * Slug of the plugin
         *
         * @example test-slug
         *
         * @var string
         */
        public $slug;
        /**
         * The project version
         *
         * @var string
         */
        public $project_version;
        /**
         * The project type
         *
         * @var string
         */
        public $type;
        /**
         * Textdomain
         *
         * @var string
         */
        public $textdomain;
        /**
         * Initialize the class
         *
         * @param string $name Readable name of the plugin.
         * @param string $public_token The public token for the store.
         * @param string $file Main plugin file path.
         */
        public function __construct($name, $public_token, $file = '')
        {
        }
        /**
         * Translate function __()
         *
         * @param string $text The text string.
         */
        public function __($text)
        {
        }
        /**
         * Initialize plugin/theme updater
         *
         * @return SureCart\Updater
         */
        public function updater()
        {
        }
        /**
         * Initialize license model
         *
         * @return SureCart\Licensing
         */
        public function license()
        {
        }
        /**
         * Initialize activation model
         *
         * @return SureCart\Licensing
         */
        public function activation()
        {
        }
        /**
         * Initialize settings page
         *
         * @return SureCart\Licensing
         */
        public function settings()
        {
        }
        /**
         * API Endpoint
         *
         * @return string
         */
        public function endpoint()
        {
        }
        /**
         * Send request to remote endpoint
         *
         * @param  array  $method The method for the request.
         * @param  string $route The route.
         * @param array  $body The body to send.
         * @param bool   $blocking Is this a blocking request.
         *
         * @return array|WP_Error   Array of results including HTTP headers or WP_Error if the request failed.
         */
        public function send_request($method = 'POST', $route = '', $body = null, $blocking = true)
        {
        }
        /**
         * Check if the current server is localhost
         *
         * @return bool
         */
        public function is_local_server()
        {
        }
        /**
         * Set project textdomain.
         *
         * @param string $textdomain The textdomain for translations.
         */
        public function set_textdomain($textdomain) : void
        {
        }
        /**
         * Set project basename, slug and version
         *
         * @return void
         */
        protected function set_basename_and_slug() : void
        {
        }
    }
}
namespace WPAIBlogger\Core {
    /**
     * Update Compatibility
     *
     * @package AutoBlog_AI
     */
    /**
     * Update initial setup
     *
     * @since x.x.x
     */
    class Maintenance
    {
        use \WPAIBlogger\Inc\Traits\Get_Instance;
        /**
         *  Constructor
         */
        public function __construct()
        {
        }
        /**
         * Init
         *
         * @since x.x.x
         * @return void
         */
        public static function init() : void
        {
        }
    }
    /**
     * Campaigns CPT
     *
     * @since 1.0.0
     */
    class CPT
    {
        use \WPAIBlogger\Inc\Traits\Get_Instance;
        /**
         * Post type name.
         *
         * @var string
         */
        public $post_type;
        /**
         * Post type labels.
         *
         * @since 1.0.0
         * @var array<string, string>
         */
        public $post_type_labels = [];
        /**
         * Post type args.
         *
         * @since 1.0.0
         * @var array<string, mixed>
         */
        public $post_type_args = [];
        /**
         * Constructor
         *
         * @since 1.0.0
         * @return void
         */
        public function __construct()
        {
        }
        /**
         * Function to initialize the CPT registration.
         *
         * @since 1.0.0
         * @return void
         */
        public function create_cpt() : void
        {
        }
        /**
         * Register the post type for the plugin.
         *
         * @since 1.0.0
         * @return void
         */
        public function register_post_type() : void
        {
        }
    }
    /**
     * Create auto blog post scheduler
     *
     * @since x.x.x
     */
    class Scheduler
    {
        use \WPAIBlogger\Inc\Traits\Get_Instance;
        /**
         *  Constructor
         */
        public function __construct()
        {
        }
        /**
         * Custom cron schedules.
         *
         * @param array $schedules Schedules.
         * @since x.x.x
         * @return array
         */
        public function custom_cron_schedules($schedules)
        {
        }
        /**
         * Create blog post.
         *
         * @param int $campaign_id Campaign ID.
         *
         * @since x.x.x
         * @return void
         */
        public function create_blog_post($campaign_id) : void
        {
        }
    }
}
namespace WPAIBlogger\Admin {
    /**
     * This class setup all admin AJAX action
     *
     * @class Ajax
     */
    class Ajax
    {
        use \WPAIBlogger\Inc\Traits\Get_Instance;
        /**
         * Holds all AJAX action events.
         *
         * @since 1.0.0
         * @access public
         *
         * @var array
         */
        public $ajax_events = ['wpaib_update_admin_setting', 'wpaib_create_campaign', 'wpaib_update_campaign', 'wpaib_get_campaign_metadata'];
        /**
         * Holds all nonce for AJAX events.
         *
         * @since 1.0.0
         * @access public
         *
         * @var array
         */
        public static $nonce = [];
        /**
         * Constructor
         *
         * @since 1.0.0
         */
        public function __construct()
        {
        }
        /**
         * Get error message.
         *
         * @param string $type Message type.
         * @return string
         * @access public
         * @since 1.0.0
         */
        public function get_error_msg($type)
        {
        }
        /**
         * Handler to update admin app settings.
         *
         * @since 1.0.0
         * @return void
         */
        public function wpaib_update_admin_setting() : void
        {
        }
        /**
         * Handler to create campaign.
         *
         * @since 1.0.0
         * @return void
         */
        public function wpaib_create_campaign() : void
        {
        }
        /**
         * Handler to update campaign.
         *
         * @since 1.0.0
         * @return void
         */
        public function wpaib_update_campaign() : void
        {
        }
        /**
         * Handler to get campaign metadata in drawer edit settings.
         *
         * @since 1.0.0
         * @return void
         */
        public function wpaib_get_campaign_metadata() : void
        {
        }
    }
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
    class Menu
    {
        use \WPAIBlogger\Inc\Traits\Get_Instance;
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
        public function __construct()
        {
        }
        /**
         * Initialize Admin Setup.
         *
         * @since x.x.x
         */
        public function settings_admin_scripts() : void
        {
        }
        /**
         * Renders the hub screen canvas.
         *
         * @since x.x.x
         */
        public function render_settings_page() : void
        {
        }
        /**
         * Enqueue the Admin's build files for plugin to work.
         *
         * @since x.x.x
         */
        public function app_build_scripts() : void
        {
        }
        /**
         * Function to load the admin area actions.
         *
         * @since x.x.x
         */
        public function initialize_hooks() : void
        {
        }
        /**
         * Add submenu to admin menu.
         *
         * @since x.x.x
         */
        public function register_plugin_menus() : void
        {
        }
    }
    /**
     * This class setup admin init
     *
     * @class API
     */
    class API extends \WP_REST_Controller
    {
        use \WPAIBlogger\Inc\Traits\Get_Instance;
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
         * Constructor
         *
         * @since x.x.x
         */
        public function __construct()
        {
        }
        /**
         * Register API routes.
         *
         * @since x.x.x
         */
        public function register_routes() : void
        {
        }
        /**
         * Get common settings.
         *
         * @param \WP_REST_Request $request Full details about the request.
         * @return array $updated_option defaults + set DB option data.
         *
         * @since x.x.x
         */
        public function get_admin_settings($request)
        {
        }
        /**
         * Check whether a given request has permission to read notes.
         *
         * @param  WP_REST_Request $request Full details about the request.
         * @return WP_Error|bool
         * @since x.x.x
         */
        public function get_permissions_check($request)
        {
        }
    }
    /**
     * Licensing handler class.
     *
     * @since x.x.x
     */
    class Licensing
    {
        use \WPAIBlogger\Inc\Traits\Get_Instance;
        /**
         * Error messages.
         *
         * @var array
         */
        public $error_messages = [];
        /**
         * Class constructor
         *
         * @since x.x.x
         * @return void
         */
        public function __construct()
        {
        }
        /**
         * Licensing setup.
         * Creates a client object for SureCart licensing.
         *
         * @since x.x.x
         * @return \SureCart\Licensing\Client
         */
        public static function licensing_setup()
        {
        }
        /**
         * Licensing setup.
         * Creates a client object for SureCart licensing.
         *
         * @since x.x.x
         * @return void
         */
        public static function init_licensing() : void
        {
        }
        /**
         * Activate license
         *
         * @hooked wp_ajax_autoblog_ai_activate_license
         * @since x.x.x
         * @return void
         */
        public function activate_license() : void
        {
        }
        /**
         * Deactivate license.
         *
         * @hooked wp_ajax_autoblog_ai_deactivate_license
         * @since x.x.x
         * @return void
         */
        public function deactivate_license() : void
        {
        }
        /**
         * Checks if license is active.
         *
         * @since x.x.x
         * @return bool
         */
        public static function is_license_active()
        {
        }
        /**
         * Display admin notice to activate license
         *
         * @since 1.0.0
         */
        public function license_activation_notice() : void
        {
        }
    }
}
namespace {
    /**
     * Get user details.
     *
     * @param string $detail Detail to get.
     * @since x.x.x
     */
    function wpaib_get_user_detail($detail)
    {
    }
    /**
     * Clean variables using sanitize_text_field.
     *
     * @param mixed $var Data to sanitize.
     * @return mixed
     *
     * @since 0.0.1
     */
    function wpaib_clean_data($var)
    {
    }
    /**
     * Get all campaigns.
     *
     * @since 0.0.1
     */
    function wpaib_get_all_campaigns()
    {
    }
    /**
     * Get all post statuses.
     *
     * @since 0.0.1
     */
    function wpaib_get_post_statuses()
    {
    }
    /**
     * Get all post types.
     *
     * @since 0.0.1
     */
    function wpaib_get_post_types()
    {
    }
    /**
     * Get all categories.
     *
     * @since 0.0.1
     */
    function wpaib_get_categories()
    {
    }
    /**
     * Get all tags.
     *
     * @since 0.0.1
     */
    function wpaib_get_tags()
    {
    }
    /**
     * Get all authors.
     *
     * @since 0.0.1
     */
    function wpaib_get_authors()
    {
    }
    /**
     * Get all custom schedules to schedule auto blog posts.
     *
     * @return array
     * @since x.x.x
     */
    function wpaib_get_schedules()
    {
    }
    /**
     * Get all custom schedules to schedule auto blog posts.
     *
     * @param int $campaign_id Campaign ID.
     * @param int $days       Days.
     * @return void
     * @since x.x.x
     */
    function wpaib_update_schedules($campaign_id, $days) : void
    {
    }
    /**
     * Check if the campaign posts target is achieved.
     *
     * @param int $campaign_id Campaign ID.
     * @return bool
     * @since x.x.x
     */
    function wpaib_is_campaign_posts_target_achieved($campaign_id)
    {
    }
    /**
     * Get API response in order to create blog post.
     *
     * @param string $keywords         Keywords.
     * @param int    $max_title_words  Max title words.
     * @param int    $max_content_words Max content words.
     * @since x.x.x
     */
    function wpaib_get_post_creation_api_response($keywords, $max_title_words, $max_content_words)
    {
    }
    /**
     * Create blog post as per the campaign configurations.
     *
     * @param int $campaign_id Campaign ID.
     * @return int|WP_Error
     * @since x.x.x
     */
    function wpaib_create_blog_post($campaign_id)
    {
    }
    // Define Constants.
    \define('WP_AI_BLOGGER_FILE', __FILE__);
    \define('WP_AI_BLOGGER_VERSION', '0.0.1');
    \define('WP_AI_BLOGGER_DIR', \plugin_dir_path(\WP_AI_BLOGGER_FILE));
    \define('WP_AI_BLOGGER_BASE_PATH', \plugin_basename(\WP_AI_BLOGGER_FILE));
    \define('WP_AI_BLOGGER_BASE_URL', \plugins_url('/', \WP_AI_BLOGGER_FILE));
    // Define Plugin Option.
    \define('WP_AI_BLOGGER_SLUG', 'wp-ai-blogger');
    \define('WP_AI_BLOGGER_DB_OPTION', 'autoblog_ai_settings');
    \define('WP_AI_BLOGGER_CAPABILITY', 'manage_options');
    // Store Linking.
    \define('WP_AI_BLOGGER_PRODUCT_NAME', 'WP AI Blogger');
    \define('WP_AI_BLOGGER_PUBLIC_TOKEN', 'pt_YA4aSFMwU9stG91RYGGfV7aq');
    \define('WP_AI_BLOGGER_PRODUCT_ID', '2effb53f-1066-40d3-9667-ef9f09f91db1');
    \define('WP_AI_BLOGGER_POST_CREATION_API', 'https://wpaiblogger.com/');
    // CPT Constants.
    \define('WP_AI_BLOGGER_CPT_CAMPAIGN', 'campaign');
    // Define Upgrade Link.
    \define('WP_AI_BLOGGER_UPGRADE_LINK', 'https://wpaiblogger.com/');
}