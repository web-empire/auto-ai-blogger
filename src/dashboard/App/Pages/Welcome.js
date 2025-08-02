import React, { useCallback, memo } from 'react';
import { __ } from '@wordpress/i18n';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Import components directly to avoid lazy loading issues
import { PostIdeas, QuickAccess, CampaignsInsights } from '@Elements/Welcome';

// Error boundary for component failures
class WelcomeErrorBoundary extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError( error ) {
		return { hasError: true, error };
	}

	componentDidCatch( error, errorInfo ) {
		console.error( 'Welcome page error:', error, errorInfo );
		// Could send to error reporting service
	}

	render() {
		if ( this.state.hasError ) {
			return (
				<div
					className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-200 rounded-lg"
					role="alert"
					aria-describedby="error-description"
				>
					<AlertCircle className="w-12 h-12 text-red-500 mb-4" aria-hidden="true" />
					<h2 className="text-lg font-semibold text-red-800 mb-2">
						{ __( 'Something went wrong', 'wp-ai-blogger' ) }
					</h2>
					<p id="error-description" className="text-red-600 mb-4">
						{ __( 'We encountered an error loading the welcome page. Please try refreshing.', 'wp-ai-blogger' ) }
					</p>
					<button
						onClick={ () => this.setState( { hasError: false, error: null } ) }
						className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
						aria-label={ __( 'Retry loading welcome page', 'wp-ai-blogger' ) }
					>
						<RefreshCw className="w-4 h-4" aria-hidden="true" />
						{ __( 'Try Again', 'wp-ai-blogger' ) }
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

// Main Welcome component with enhanced features
function Welcome() {
	const handleComponentError = useCallback( ( error, errorInfo ) => {
		console.error( 'Welcome component error:', error, errorInfo );
		// Could integrate with error tracking service
	}, [] );

	return (
		<WelcomeErrorBoundary>
			<main
				className="welcome-page"
				role="main"
				aria-label={ __( 'Welcome dashboard', 'wp-ai-blogger' ) }
			>
				{ /* Screen reader announcement for dynamic content */ }
				<div className="sr-only" aria-live="polite" aria-atomic="true">
					{ __( 'Welcome page content loaded', 'wp-ai-blogger' ) }
				</div>

				{ /* Campaigns insights section */ }
				<section
					aria-labelledby="campaigns-heading"
				>
					<h2 id="campaigns-heading" className="sr-only">
						{ __( 'Campaigns Insights', 'wp-ai-blogger' ) }
					</h2>
					<CampaignsInsights onError={ handleComponentError } />
				</section>

				{ /* Post ideas and Quick Access sections - side by side */ }
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<section>
						<PostIdeas onError={ handleComponentError } />
					</section>

					<section>
						<QuickAccess onError={ handleComponentError } />
					</section>
				</div>
			</main>
		</WelcomeErrorBoundary>
	);
}

// Add display name for debugging
Welcome.displayName = 'Welcome';

export default memo( Welcome );
