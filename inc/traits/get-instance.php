<?php
/**
 * Trait.
 *
 * @package AutoBlog_AI
 * @since x.x.x
 */

namespace WPAIBlogger\Inc\Traits;

/**
 * Trait Get_Instance.
 *
 * @since x.x.x
 */
trait Get_Instance {
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
	public static function get_instance() {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
