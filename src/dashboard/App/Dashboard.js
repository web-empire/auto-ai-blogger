import React, { Suspense } from 'react';
import MainNav from './MainNav';
import PagesRoute from './PagesRoute';
import SettingsSavedNotification from './SettingsSavedNotification';
import ErrorBoundary from '@Components/ErrorBoundary';

/**
 * Error fallback component for error boundaries
 */
const ErrorFallback = ( { error, resetErrorBoundary } ) => (
	<div
		className="min-h-[200px] flex items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg mx-4 my-6"
		role="alert"
		aria-live="assertive"
	>
		<div className="text-center">
			<h2 className="text-lg font-semibold text-red-800 mb-2">
				Something went wrong
			</h2>
			<p className="text-red-600 mb-4">
				{ error?.message || 'An unexpected error occurred' }
			</p>
			<button
				onClick={ resetErrorBoundary }
				className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
				type="button"
			>
				Try again
			</button>
		</div>
	</div>
);

/**
 * Loading fallback component for Suspense
 */
const LoadingFallback = () => (
	<div
		className="min-h-[200px] flex items-center justify-center p-6"
		aria-live="polite"
		aria-label="Loading content"
	>
		<div className="flex items-center space-x-2 text-slate-600">
			<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
			<span>Loading...</span>
		</div>
	</div>
);

/**
 * Enhanced Dashboard component with error handling and performance optimization
 */
const Dashboard = () => {
	return (
		<div className="wp-ai-blogger-dashboard" role="main">
			<ErrorBoundary>
				<MainNav />
				<SettingsSavedNotification />
				<Suspense fallback={ <LoadingFallback /> }>
					<PagesRoute />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

export default Dashboard;
