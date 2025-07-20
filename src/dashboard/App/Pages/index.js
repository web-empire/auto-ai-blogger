// Enhanced Pages module exports with lazy loading support and better organization
import { lazy } from 'react';

// Lazy load page components for better performance
const Welcome = lazy(() => import('./Welcome'));
const Settings = lazy(() => import('./Settings'));
const FreeVsPro = lazy(() => import('./FreeVsPro'));
const Campaigns = lazy(() => import('./Campaigns'));

// Page metadata for better organization and routing
export const pageMetadata = {
	WELCOME: {
		component: Welcome,
		path: '/welcome',
		title: 'Welcome',
		description: 'Dashboard overview and insights',
		icon: 'home'
	},
	SETTINGS: {
		component: Settings,
		path: '/settings',
		title: 'Settings',
		description: 'Configure your AI Blogger settings',
		icon: 'settings'
	},
	FREE_VS_PRO: {
		component: FreeVsPro,
		path: '/free-vs-pro',
		title: 'Free vs Pro',
		description: 'Compare features and upgrade options',
		icon: 'compare'
	},
	CAMPAIGNS: {
		component: Campaigns,
		path: '/campaigns',
		title: 'Campaigns',
		description: 'Manage your blog campaigns',
		icon: 'campaigns'
	}
};

// Export individual components (maintaining backward compatibility)
export {
	Welcome,
	Settings,
	FreeVsPro,
	Campaigns,
};

// Export page list for routing and navigation
export const pages = Object.values(pageMetadata);

// Export default pages object for easier imports
export default {
	Welcome,
	Settings,
	FreeVsPro,
	Campaigns,
	pageMetadata,
	pages
};
