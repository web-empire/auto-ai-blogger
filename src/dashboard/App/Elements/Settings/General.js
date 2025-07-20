import React, { memo, Suspense } from 'react';
import { __ } from '@wordpress/i18n';
import { Settings } from 'lucide-react';
import SettingsContainer from '@Components/SettingsContainer';

// Lazy load the Persona component for better performance
const Persona = React.lazy(() => import('@Elements/Settings/Group').then(module => ({ default: module.Persona })));

// Loading fallback component
const PersonaLoader = memo(() => (
	<div className="animate-pulse space-y-6" role="status" aria-label={__('Loading persona settings...', 'wp-ai-blogger')}>
		<div className="space-y-4">
			<div className="h-4 bg-gray-300 rounded w-1/4"></div>
			<div className="h-10 bg-gray-200 rounded"></div>
		</div>
		<div className="space-y-4">
			<div className="h-4 bg-gray-300 rounded w-1/3"></div>
			<div className="h-10 bg-gray-200 rounded"></div>
		</div>
		<div className="space-y-4">
			<div className="h-4 bg-gray-300 rounded w-1/2"></div>
			<div className="h-24 bg-gray-200 rounded"></div>
		</div>
		<div className="sr-only">{__('Loading settings form...', 'wp-ai-blogger')}</div>
	</div>
));

PersonaLoader.displayName = 'PersonaLoader';

// Enhanced General settings component
const General = memo(() => {
	return (
		<main
			className="space-y-6"
			role="main"
			aria-labelledby="general-settings-heading"
		>
			{/* Enhanced header section */}
			<header className="border-b border-gray-200 pb-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-indigo-100 rounded-lg">
						<Settings className="w-5 h-5 text-indigo-600" aria-hidden="true" />
					</div>
					<div>
						<h1 id="general-settings-heading" className="text-2xl font-bold text-gray-900">
							{__('General Settings', 'wp-ai-blogger')}
						</h1>
						<p className="text-gray-600 mt-1">
							{__('Configure your site persona and AI content preferences.', 'wp-ai-blogger')}
						</p>
					</div>
				</div>
			</header>

			{/* Settings content with error boundary */}
			<section aria-labelledby="persona-section-heading">
				<Suspense
					fallback={<PersonaLoader />}
				>
					<SettingsContainer
						title={__('Site Persona', 'wp-ai-blogger')}
						description={__('Help AI understand your site\'s personality and target audience to generate more relevant and engaging content.', 'wp-ai-blogger')}
						element={
							<div className="space-y-4">
								<Persona />

								{/* Additional help text */}
								<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<h3 className="text-sm font-medium text-blue-900 mb-2">
										{__('💡 Pro Tips for Better Results', 'wp-ai-blogger')}
									</h3>
									<ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
										<li>{__('Be specific about your target audience and industry', 'wp-ai-blogger')}</li>
										<li>{__('Include your brand voice and tone preferences', 'wp-ai-blogger')}</li>
										<li>{__('Mention any specific topics or keywords you focus on', 'wp-ai-blogger')}</li>
									</ul>
								</div>
							</div>
						}
						className="bg-white shadow-sm rounded-lg border border-gray-200"
					/>
				</Suspense>
			</section>

			{/* Screen reader navigation summary */}
			<div className="sr-only" aria-live="polite">
				{__('General settings page loaded with persona configuration options', 'wp-ai-blogger')}
			</div>
		</main>
	);
});

General.displayName = 'GeneralSettings';

export default General;
