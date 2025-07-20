import React, { memo, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { Check, X, Zap, Crown, Users, BarChart3, Calendar, Sparkles, Target, Search, Shield, Headphones } from 'lucide-react';

// Enhanced feature categories for better organization
export const FeatureCategories = {
	CONTENT: {
		id: 'content',
		label: __('Content Generation', 'wp-ai-blogger'),
		icon: <Sparkles className="w-5 h-5" />,
		description: __('AI-powered content creation capabilities', 'wp-ai-blogger')
	},
	AUTOMATION: {
		id: 'automation',
		label: __('Automation & Scheduling', 'wp-ai-blogger'),
		icon: <Calendar className="w-5 h-5" />,
		description: __('Automated publishing and management features', 'wp-ai-blogger')
	},
	SEO: {
		id: 'seo',
		label: __('SEO & Optimization', 'wp-ai-blogger'),
		icon: <Target className="w-5 h-5" />,
		description: __('Search engine optimization tools', 'wp-ai-blogger')
	},
	ANALYTICS: {
		id: 'analytics',
		label: __('Analytics & Insights', 'wp-ai-blogger'),
		icon: <BarChart3 className="w-5 h-5" />,
		description: __('Performance tracking and analytics', 'wp-ai-blogger')
	},
	SUPPORT: {
		id: 'support',
		label: __('Support & Updates', 'wp-ai-blogger'),
		icon: <Headphones className="w-5 h-5" />,
		description: __('Customer support and product updates', 'wp-ai-blogger')
	}
};

// Enhanced features with better categorization and metadata
export const FeaturesList = [
	// Content Generation Features
	{
		id: 'blog-topics',
		name: __('Blog Post Topics', 'wp-ai-blogger'),
		category: 'content',
		free: __('5 per month', 'wp-ai-blogger'),
		pro: __('Unlimited', 'wp-ai-blogger'),
		description: __('AI-generated blog post ideas tailored to your niche', 'wp-ai-blogger'),
		priority: 'high'
	},
	{
		id: 'content-generation',
		name: __('Content Generation', 'wp-ai-blogger'),
		category: 'content',
		free: __('Basic (500 words)', 'wp-ai-blogger'),
		pro: __('Premium (5000+ words)', 'wp-ai-blogger'),
		description: __('Full-length article generation with advanced AI models', 'wp-ai-blogger'),
		priority: 'high'
	},
	{
		id: 'ai-tokens',
		name: __('AI Generation Tokens', 'wp-ai-blogger'),
		category: 'content',
		free: __('1,000 tokens/month', 'wp-ai-blogger'),
		pro: __('100,000+ tokens/month', 'wp-ai-blogger'),
		description: __('Token allocation for AI content generation', 'wp-ai-blogger'),
		priority: 'high'
	},
	{
		id: 'humanized-content',
		name: __('Humanized Content', 'wp-ai-blogger'),
		category: 'content',
		free: __('Basic humanization', 'wp-ai-blogger'),
		pro: __('Advanced humanization', 'wp-ai-blogger'),
		description: __('Make AI content sound natural and engaging', 'wp-ai-blogger'),
		priority: 'medium'
	},

	// Automation Features
	{
		id: 'auto-scheduling',
		name: __('Auto Scheduling Posts', 'wp-ai-blogger'),
		category: 'automation',
		free: 'no',
		pro: 'yes',
		description: __('Automatically schedule and publish content', 'wp-ai-blogger'),
		priority: 'high'
	},

	// SEO Features
	{
		id: 'keyword-usage',
		name: __('High-Ranking Keywords', 'wp-ai-blogger'),
		category: 'seo',
		free: __('Basic research', 'wp-ai-blogger'),
		pro: __('Advanced keyword targeting', 'wp-ai-blogger'),
		description: __('Target high-ranking keywords for better SEO', 'wp-ai-blogger'),
		priority: 'high'
	},
	{
		id: 'seo-content',
		name: __('SEO-Optimized Content', 'wp-ai-blogger'),
		category: 'seo',
		free: __('Basic optimization', 'wp-ai-blogger'),
		pro: __('Advanced SEO features', 'wp-ai-blogger'),
		description: __('Content optimized for search engines', 'wp-ai-blogger'),
		priority: 'high'
	},

	// Analytics Features
	{
		id: 'analytics',
		name: __('Performance Analytics', 'wp-ai-blogger'),
		category: 'analytics',
		free: __('Basic stats', 'wp-ai-blogger'),
		pro: __('Advanced analytics', 'wp-ai-blogger'),
		description: __('Track content performance and engagement', 'wp-ai-blogger'),
		priority: 'medium'
	},

	// Support Features
	{
		id: 'support',
		name: __('Premium Support', 'wp-ai-blogger'),
		category: 'support',
		free: __('Community support', 'wp-ai-blogger'),
		pro: __('24/7 priority support', 'wp-ai-blogger'),
		description: __('Get help when you need it most', 'wp-ai-blogger'),
		priority: 'medium'
	},
	{
		id: 'updates',
		name: __('Pro Updates & Features', 'wp-ai-blogger'),
		category: 'support',
		free: __('Basic updates', 'wp-ai-blogger'),
		pro: __('Early access to new features', 'wp-ai-blogger'),
		description: __('Access to the latest features and improvements', 'wp-ai-blogger'),
		priority: 'low'
	}
];

// Enhanced feature comparison component
export const FeatureComparisonTable = memo(() => {
	// Group features by category
	const featuresByCategory = useMemo(() => {
		const grouped = {};
		FeaturesList.forEach(feature => {
			if (!grouped[feature.category]) {
				grouped[feature.category] = [];
			}
			grouped[feature.category].push(feature);
		});
		return grouped;
	}, []);

	// Feature status component
	const FeatureStatus = memo(({ status, isProColumn = false }) => {
		const getStatusDisplay = useMemo(() => {
			if (status === 'yes') {
				return {
					icon: <Check className="w-4 h-4 text-green-600" />,
					text: __('Included', 'wp-ai-blogger'),
					className: 'text-green-600 bg-green-50 border-green-200'
				};
			}

			if (status === 'no') {
				return {
					icon: <X className="w-4 h-4 text-red-500" />,
					text: __('Not included', 'wp-ai-blogger'),
					className: 'text-red-500 bg-red-50 border-red-200'
				};
			}

			// Custom status (like "Limited", "5 per month", etc.)
			return {
				icon: isProColumn ? <Crown className="w-4 h-4 text-amber-600" /> : <Shield className="w-4 h-4 text-blue-600" />,
				text: status,
				className: isProColumn ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-blue-700 bg-blue-50 border-blue-200'
			};
		}, [status, isProColumn]);

		return (
			<div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusDisplay.className}`}>
				{getStatusDisplay.icon}
				<span>{getStatusDisplay.text}</span>
			</div>
		);
	});

	FeatureStatus.displayName = 'FeatureStatus';

	return (
		<div className="space-y-8">
			{Object.entries(featuresByCategory).map(([categoryId, features]) => {
				const category = FeatureCategories[categoryId.toUpperCase()];
				if (!category) return null;

				return (
					<div key={categoryId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
						{/* Category header */}
						<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-white rounded-lg border border-gray-200">
									{category.icon}
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{category.label}
									</h3>
									<p className="text-sm text-gray-600">
										{category.description}
									</p>
								</div>
							</div>
						</div>

						{/* Features table */}
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											{__('Feature', 'wp-ai-blogger')}
										</th>
										<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											{__('Free Version', 'wp-ai-blogger')}
										</th>
										<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											{__('Pro Version', 'wp-ai-blogger')}
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{features.map((feature) => (
										<tr key={feature.id} className="hover:bg-gray-50 transition-colors duration-150">
											<td className="px-6 py-4">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{feature.name}
													</div>
													<div className="text-sm text-gray-500">
														{feature.description}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-center">
												<FeatureStatus status={feature.free} isProColumn={false} />
											</td>
											<td className="px-6 py-4 text-center">
												<FeatureStatus status={feature.pro} isProColumn={true} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				);
			})}
		</div>
	);
});

FeatureComparisonTable.displayName = 'FeatureComparisonTable';

// Enhanced features for backward compatibility (legacy format)
export const Features = FeaturesList.map(feature => ({
	name: feature.name,
	free: feature.free,
	pro: feature.pro,
	description: feature.description,
	category: feature.category,
	priority: feature.priority
}));

// Export default as the comparison table
export default FeatureComparisonTable;
