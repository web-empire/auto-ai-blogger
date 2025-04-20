import { __ } from '@wordpress/i18n';

export const Features = [
	{ name: __( 'Humanized Content', 'wp-ai-blogger' ) },
	{ name: __( 'Auto Scheduling Posts', 'wp-ai-blogger' ) },
	{ name: __( 'Analytics', 'wp-ai-blogger' ) },
	{
		name: __( 'Blog Post Topic', 'wp-ai-blogger' ),
		free: __( 'Limited', 'wp-ai-blogger' ),
		pro: __( 'Unlimited', 'wp-ai-blogger' ),
	},
	{
		name: __( 'Content Generation', 'wp-ai-blogger' ),
		free: __( 'Limited', 'wp-ai-blogger' ),
		pro: __( 'Unlimited', 'wp-ai-blogger' ),
	},
	{
		name: __( 'AI Content Generation Tokens', 'wp-ai-blogger' ),
		free: __( 'Basic', 'wp-ai-blogger' ),
		pro: __( 'Premium', 'wp-ai-blogger' ),
	},
	{
		name: __( 'Highly Ranked Keywords Usage', 'wp-ai-blogger' ),
		free: __( 'Basic', 'wp-ai-blogger' ),
		pro: __( 'Premium', 'wp-ai-blogger' ),
	},
	{
		name: __( 'Humanized Content', 'wp-ai-blogger' ),
		free: __( 'Basic', 'wp-ai-blogger' ),
		pro: __( 'Premium', 'wp-ai-blogger' ),
	},
	{
		name: __( 'SEO Friendly Content', 'wp-ai-blogger' ),
		free: __( 'Basic', 'wp-ai-blogger' ),
		pro: __( 'Premium', 'wp-ai-blogger' ),
	},
	{ name: __( '24/7 Premium Support', 'wp-ai-blogger' ) },
	{ name: __( 'Access To Pro Updates', 'wp-ai-blogger' ) },
].map( ( feature ) => ( {
	...feature,
	free: feature.free || 'no',
	pro: feature.pro || 'yes',
} ) );
