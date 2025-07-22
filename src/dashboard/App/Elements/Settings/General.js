import React, { memo } from 'react';
import { __ } from '@wordpress/i18n';
import { Settings } from 'lucide-react';
import SettingsContainer from '@Components/SettingsContainer';
import DynamicCard from '@Components/DynamicCard';

// Import the Persona component directly to avoid double lazy loading
import { Persona } from '@Elements/Settings/Group';

// Enhanced General settings component
const General = memo(() => {
	return (
		<main
			className="space-y-6"
			role="main"
			aria-labelledby="general-settings-heading"
		>
			{/* Enhanced header using DynamicCard */}
			<DynamicCard
				icon={Settings}
				heading={__('General Settings', 'wp-ai-blogger')}
				colorScheme="indigo"
				size="large"
				className="border-b border-gray-200 pb-4"
			/>

			{/* Settings content */}
			<section aria-labelledby="persona-section-heading">
				<SettingsContainer
					title={__('Site Persona', 'wp-ai-blogger')}
					description={__('Help AI understand your site\'s personality and target audience to generate more relevant and engaging content.', 'wp-ai-blogger')}
					element={<Persona />}
					className="bg-white shadow-sm rounded-lg border border-gray-200"
				/>
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
