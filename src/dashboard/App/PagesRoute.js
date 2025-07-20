import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

/**
 * Error component for invalid routes or access denied
 */
const RouteError = ( { type = 'not-found', message } ) => {
	const errorMessages = {
		'not-found': __( 'Page not found. Please check the URL and try again.', 'wp-ai-blogger' ),
		'access-denied': __( 'Access denied. This feature requires a valid license.', 'wp-ai-blogger' ),
		'invalid-page': __( 'Invalid page parameter. Please navigate from the main menu.', 'wp-ai-blogger' ),
		'generic': message || __( 'Something went wrong. Please try again.', 'wp-ai-blogger' ),
	};

	const getErrorTitle = () => {
		switch ( type ) {
			case 'not-found':
				return __( '404 - Page Not Found', 'wp-ai-blogger' );
			case 'access-denied':
				return __( 'Access Denied', 'wp-ai-blogger' );
			case 'invalid-page':
				return __( 'Invalid Page', 'wp-ai-blogger' );
			default:
				return __( 'Error', 'wp-ai-blogger' );
		}
	};

	return (
		<div
			className="flex items-center justify-center min-h-[400px] p-6"
			role="alert"
			aria-live="assertive"
		>
			<div className="text-center max-w-md">
				<div className="mb-4">
					<svg
						className="mx-auto h-16 w-16 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={ 1 }
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<h1 className="text-2xl font-bold text-slate-900 mb-2">
					{ getErrorTitle() }
				</h1>
				<p className="text-slate-600 mb-6">
					{ errorMessages[ type ] }
				</p>
				<button
					onClick={ () => {
						try {
							const homeSlug = ( typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.home_slug )
								? wpaib_localized_data.home_slug
								: 'wp-ai-blogger';
							window.location.href = `?page=${ homeSlug }`;
						} catch ( error ) {
							console.warn( 'Error navigating to home page:', error );
							window.location.href = '?page=wp-ai-blogger';
						}
					} }
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
					type="button"
				>
					{ __( 'Go to Welcome Page', 'wp-ai-blogger' ) }
				</button>
			</div>
		</div>
	);
};

// Import components directly to avoid lazy loading issues temporarily
import Welcome from '@DashboardApp/Pages/Welcome';
import Settings from '@DashboardApp/Pages/Settings';
import FreeVsPro from '@DashboardApp/Pages/FreeVsPro';
import Campaigns from '@DashboardApp/Pages/Campaigns';

/**
 * Route mapping with metadata
 */
const ROUTE_MAP = {
	'getting-started': {
		component: Welcome,
		title: __( 'Getting Started', 'wp-ai-blogger' ),
		requiresLicense: false,
	},
	'': {
		component: Welcome,
		title: __( 'Welcome', 'wp-ai-blogger' ),
		requiresLicense: false,
	},
	settings: {
		component: Settings,
		title: __( 'Settings', 'wp-ai-blogger' ),
		requiresLicense: false,
	},
	'free-vs-pro': {
		component: FreeVsPro,
		title: __( 'Free vs Pro', 'wp-ai-blogger' ),
		requiresLicense: false,
	},
	campaigns: {
		component: Campaigns,
		title: __( 'Campaigns', 'wp-ai-blogger' ),
		requiresLicense: true,
	},
};

/**
 * Loading component for Suspense fallback
 */
const PageLoader = () => (
	<div
		className="flex items-center justify-center min-h-[400px] p-6"
		aria-live="polite"
		aria-label={ __( 'Loading page content', 'wp-ai-blogger' ) }
	>
		<div className="flex items-center space-x-3 text-slate-600">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span className="text-lg font-medium">
				{ __( 'Loading...', 'wp-ai-blogger' ) }
			</span>
		</div>
	</div>
);

/**
 * Enhanced PagesRoute component with better error handling and performance
 */
const PagesRoute = () => {
	const { search } = useLocation();

	// Memoize URL parsing with safe data access
	const { page, path, isValidPage } = useMemo( () => {
		try {
			const query = new URLSearchParams( search );
			const currentPage = query.get( 'page' ) || '';
			const currentPath = query.get( 'path' ) || '';

			// Safely access localized data
			const homeSlug = ( typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.home_slug )
				? wpaib_localized_data.home_slug
				: 'wp-ai-blogger';

			return {
				page: currentPage,
				path: currentPath,
				isValidPage: currentPage === homeSlug,
			};
		} catch ( error ) {
			console.warn( 'Error parsing URL parameters:', error );
			return {
				page: '',
				path: '',
				isValidPage: false,
			};
		}
	}, [ search ] );

	// Memoize license status with safe data access
	const isLicensed = useMemo( () => {
		try {
			return ( typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.license_status === 'licensed' );
		} catch ( error ) {
			console.warn( 'Error accessing license status:', error );
			return false;
		}
	}, [ wpaib_localized_data?.license_status ] );

	// Handle invalid page parameter
	if ( ! isValidPage ) {
		return <RouteError type="invalid-page" />;
	}

	// Get route configuration safely
	const routeConfig = ROUTE_MAP[ path ] || ROUTE_MAP[ '' ];

	// Handle route not found
	if ( ! routeConfig ) {
		return <RouteError type="not-found" />;
	}

	// Handle license requirement
	if ( routeConfig.requiresLicense && ! isLicensed ) {
		return <RouteError type="access-denied" />;
	}

	const { component: Component, title } = routeConfig;

	// Set document title for better UX and SEO
	React.useEffect( () => {
		try {
			if ( title ) {
				const originalTitle = document.title;
				document.title = `${ title } - WP AI Blogger`;

				// Cleanup on unmount
				return () => {
					document.title = originalTitle;
				};
			}
		} catch ( error ) {
			console.warn( 'Error setting document title:', error );
		}
	}, [ title ] );

	// Render with error handling
	try {
		// Validate component before rendering
		if ( ! Component || typeof Component !== 'function' ) {
			console.error( 'Invalid component:', Component );
			return <RouteError type="generic" message="Invalid component configuration" />;
		}

		return (
			<div className="wp-ai-blogger-page" data-page={ path || 'welcome' }>
				<Component />
			</div>
		);
	} catch ( error ) {
		console.error( 'Error rendering PagesRoute:', error );
		return <RouteError type="generic" message="Failed to render page" />;
	}
};

export default PagesRoute;
