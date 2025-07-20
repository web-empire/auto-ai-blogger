// Enhanced Welcome Elements module with lazy loading and metadata
import { lazy } from 'react';

// Lazy load components for better performance
const CampaignsInsights = lazy(() => import('./CampaignsInsights'));
const PostIdeas = lazy(() => import('./PostIdeas/PostIdeas'));

// Component metadata for better organization
export const welcomeComponents = {
	CAMPAIGNS_INSIGHTS: {
		component: CampaignsInsights,
		name: 'CampaignsInsights',
		description: 'Dashboard insights showing campaign statistics and performance',
		category: 'analytics'
	},
	POST_IDEAS: {
		component: PostIdeas,
		name: 'PostIdeas',
		description: 'AI-generated blog post ideas and suggestions',
		category: 'content'
	}
};

// Export individual components (maintaining backward compatibility)
export {
	CampaignsInsights,
	PostIdeas,
};

// Export component list for dynamic rendering
export const components = Object.values(welcomeComponents);

// Export default for easier imports
export default {
	CampaignsInsights,
	PostIdeas,
	welcomeComponents,
	components
};
