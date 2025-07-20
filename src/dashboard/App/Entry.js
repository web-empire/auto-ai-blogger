import React, { Suspense, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { __ } from '@wordpress/i18n';

// Lazy load components for better performance
import AppLoader from '@Components/AppLoader';
const Wizard = React.lazy( () => import( './Wizard' ) );
const Dashboard = React.lazy( () => import( './Dashboard' ) );

/**
 * Enhanced loading component for lazy-loaded routes
 */
const RouteLoader = () => (
	<div
		className="min-h-screen flex items-center justify-center bg-slate-50"
		aria-live="polite"
		aria-label={ __( 'Loading application', 'wp-ai-blogger' ) }
	>
		<div className="flex flex-col items-center space-y-4">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			<p className="text-slate-600 font-medium">
				{ __( 'Loading WP AI Blogger...', 'wp-ai-blogger' ) }
			</p>
		</div>
	</div>
);

/**
 * Main Entry component with enhanced state management and performance optimization
 */
const Entry = () => {
	const dispatch = useDispatch();

	// Memoized selectors for better performance
	const appState = useSelector( ( state ) => ( {
		initialStateSetFlag: state.initialStateSetFlag,
		userOnboarded: state.userOnboarded,
		isLoading: state.isLoading,
		error: state.error,
	} ) );

	// Memoize the component to render based on app state
	const componentToRender = useMemo( () => {
		const { initialStateSetFlag, userOnboarded, isLoading, error } = appState;

		// Show loader if initial state is not set or app is loading
		if ( ! initialStateSetFlag || isLoading ) {
			return 'loader';
		}

		// Show error state if there's an error
		if ( error ) {
			return 'error';
		}

		// Show Dashboard if user is onboarded, otherwise show Wizard
		return userOnboarded ? 'dashboard' : 'wizard';
	}, [ appState ] );

	// Initialize app state on mount
	useEffect( () => {
		// Only dispatch if the flag hasn't been set yet
		if ( ! appState.initialStateSetFlag ) {
			dispatch( {
				type: 'UPDATE_INITIAL_STATE_FLAG',
				payload: true,
			} );
		}
	}, [] ); // Empty dependency array for mount-only effect

	// Error recovery function
	const handleErrorRecovery = () => {
		dispatch( { type: 'CLEAR_ERROR' } );
		dispatch( {
			type: 'UPDATE_INITIAL_STATE_FLAG',
			payload: false,
		} );
	};

	// Render based on computed component type
	switch ( componentToRender ) {
		case 'loader':
			return <AppLoader />;

		case 'error':
			return (
				<div
					className="min-h-screen flex items-center justify-center bg-slate-50 p-6"
					role="alert"
					aria-live="assertive"
				>
					<div className="text-center max-w-md">
						<div className="mb-6">
							<svg
								className="mx-auto h-16 w-16 text-red-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={ 1.5 }
									d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-slate-900 mb-3">
							{ __( 'Application Error', 'wp-ai-blogger' ) }
						</h1>
						<p className="text-slate-600 mb-6">
							{ appState.error || __( 'An unexpected error occurred while loading the application.', 'wp-ai-blogger' ) }
						</p>
						<div className="space-y-3">
							<button
								onClick={ handleErrorRecovery }
								className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
								type="button"
							>
								{ __( 'Try Again', 'wp-ai-blogger' ) }
							</button>
							<button
								onClick={ () => window.location.reload() }
								className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
								type="button"
							>
								{ __( 'Reload Page', 'wp-ai-blogger' ) }
							</button>
						</div>
					</div>
				</div>
			);

		case 'dashboard':
			return (
				<Suspense fallback={ <RouteLoader /> }>
					<Dashboard />
				</Suspense>
			);

		case 'wizard':
			return (
				<Suspense fallback={ <RouteLoader /> }>
					<Wizard />
				</Suspense>
			);

		default:
			return <AppLoader />;
	}
};

export default Entry;
