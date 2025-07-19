<?php
/**
 * Posts Filter.
 *
 * Added posts CPT column filter support for campaign on basis of 'wp_aib_reference' meta key.
 * 
 * Sort posts table based on campaign.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace WPAIBlogger\Core;

use WPAIBlogger\Inc\Traits\Get_Instance;

/**
 * Frontend Compatibility
 *
 * @package AutoBlog_AI
 */

/**
 * Posts Filter.
 *
 * @since x.x.x
 */
class Posts_Filter {
	use Get_Instance;

	/**
	 * Constructor
	 *
	 * @since x.x.x
	 *
	 * @return void
	 */
	public function __construct() {
	}
}
