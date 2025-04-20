<?php
/**
 * Trait.
 *
 * @package AutoBlog_AI
 * @since 0.0.1
 */

namespace WPAIBlogger\Inc\Traits;

/**
 * Trait Get_Instance.
 *
 * @since 0.0.1
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
	 * @since 0.0.1
	 * @return object initialized object of class.
	 */
	public static function get_instance() {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
