# Auto AI Blogger #

**Contributors:** [wpsolvex](https://profiles.wordpress.org/wpsolvex/)  
**Tags:** blog, blogging, content creation, auto blogging, seo  
**Tested up to:** 6.9  
**Stable tag:** 0.0.2  
**License:** GPLv2 or later  
**License URI:** http://www.gnu.org/licenses/gpl-2.0.html  

This is not just a content creator, its beyond the auto-blogging.

## Description ##

This is not just a content creator, its beyond the auto-blogging.

## External Services ##

This plugin relies on an external service operated by WP AI Blogger (WP Solvex) to provide AI-powered content generation features.

The external service is required for the core functionality of the plugin, including generating blog posts and managing token usage.

### What the service is used for
- Generating AI-based blog post content from post titles
- Generating campaign-based blog posts using user-defined keywords and configurations
- Generating post content from a provided title
- Retrieving token usage and license-related data

### What data is sent and when
The plugin sends data to the external service only when initiated by the site administrator. Depending on the feature used, this may include:
- Post titles, keywords, and campaign configuration entered by the user
- Site metadata such as site title and site description (used to improve content relevance)
- Plugin license key and token usage identifiers
- Technical information such as plugin version and WordPress version

User name and email address are collected only when the user explicitly provides consent.
If consent is not provided, we do not collect or process any personal user data.

### Service provider
The external service is provided by:

WP AI Blogger (WP Solvex)
API domain: https://wpaiblogger.com

### Terms and Privacy Policy
- Terms of Service: https://wpaiblogger.com/terms-and-conditions/
- Privacy Policy: https://wpaiblogger.com/privacy-policy/


## Screenshots ##
1. Admin screen.

## Installation ##

1. Upload the plugin files to the `/wp-content/plugins/auto-ai-blogger` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.

## Changelog ##

### 0.0.2 ###
* Improvement: Feedback as per WordPress plugin review team has been implemented.

### 0.0.1 ###
* Initial release
