import React, { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { ArrowRight, Sparkles, Zap, Globe, Users } from 'lucide-react';

// Enhanced feature card component
const FeatureCard = memo(({ icon: Icon, title, description }) => (
	<div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
		<div className="p-3 bg-indigo-100 rounded-lg mb-4">
			<Icon className="w-6 h-6 text-indigo-600" aria-hidden="true" />
		</div>
		<h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
			{title}
		</h3>
		<p className="text-sm text-gray-600 text-center leading-relaxed">
			{description}
		</p>
	</div>
));

FeatureCard.displayName = 'WelcomeFeatureCard';

// Enhanced action button component
const ActionButton = memo(({ onClick, children, icon: Icon }) => {
	const handleClick = useCallback((e) => {
		e.preventDefault();
		onClick(e);
	}, [onClick]);

	const handleKeyDown = useCallback((e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(e);
		}
	}, [handleClick]);

	return (
		<button
			type="button"
			className="
				group inline-flex items-center gap-3 px-8 py-4
				bg-gradient-to-r from-indigo-600 to-purple-600
				text-white font-semibold rounded-xl shadow-lg
				hover:from-indigo-700 hover:to-purple-700
				focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
				transform transition-all duration-200 hover:scale-105 hover:shadow-xl
			"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			aria-label={__("Start the setup wizard", 'wp-ai-blogger')}
		>
			<span className="text-lg">{children}</span>
			{Icon && (
				<Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
			)}
		</button>
	);
});

ActionButton.displayName = 'WelcomeActionButton';

const WelcomeStep = memo(() => {
	const navigate = useNavigate();

	// Enhanced navigation handler
	const handleStepRedirection = useCallback((e) => {
		e.preventDefault();
		const targetStep = 'persona-form';
		navigate(`${wpaib_localized_data.admin_app_url}&step=${targetStep}`);
	}, [navigate]);

	// Feature data
	const features = [
		{
			icon: Sparkles,
			title: __('AI-Powered Content', 'wp-ai-blogger'),
			description: __('Generate high-quality blog posts automatically using advanced AI technology.', 'wp-ai-blogger')
		},
		{
			icon: Zap,
			title: __('Lightning Fast Setup', 'wp-ai-blogger'),
			description: __('Get your automated blog running in just a few minutes with our guided setup.', 'wp-ai-blogger')
		},
		{
			icon: Globe,
			title: __('Multi-Language Support', 'wp-ai-blogger'),
			description: __('Create content in multiple languages to reach a global audience.', 'wp-ai-blogger')
		},
		{
			icon: Users,
			title: __('SEO Optimized', 'wp-ai-blogger'),
			description: __('All generated content is optimized for search engines and user engagement.', 'wp-ai-blogger')
		}
	];

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4"
			role="main"
			aria-labelledby="welcome-heading"
		>
			<div className="max-w-6xl mx-auto">
				{/* Welcome content */}
				<div className="text-center mb-16">
					{/* Step indicator */}
					<div className="mb-8">
						<span className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full tracking-wide uppercase">
							<Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
							{__('Step 1 of 5', 'wp-ai-blogger')}
						</span>
					</div>

					{/* Main heading */}
					<h1
						id="welcome-heading"
						className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
					>
						{__('Welcome to', 'wp-ai-blogger')}
						<br />
						<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							{__('WP AI Blogger', 'wp-ai-blogger')}
						</span>
					</h1>

					{/* Description */}
					<p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
						{__(
							"Transform your WordPress site into an AI-powered content machine. Generate engaging blog posts, boost SEO, and grow your audience automatically.",
							'wp-ai-blogger'
						)}
					</p>

					{/* Call to action */}
					<div className="mb-16">
						<ActionButton
							onClick={handleStepRedirection}
							icon={ArrowRight}
						>
							{__("Let's Get Started", 'wp-ai-blogger')}
						</ActionButton>
					</div>
				</div>

				{/* Features grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					{features.map((feature, index) => (
						<FeatureCard
							key={index}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
						/>
					))}
				</div>

				{/* Additional info */}
				<div className="text-center">
					<p className="text-sm text-gray-500 max-w-2xl mx-auto">
						{__(
							"This setup wizard will guide you through configuring your AI blogger settings, license activation, and initial content preferences. The entire process takes less than 5 minutes.",
							'wp-ai-blogger'
						)}
					</p>
				</div>
			</div>

			{/* Screen reader announcements */}
			<div className="sr-only" aria-live="polite">
				{__('Welcome to WP AI Blogger setup wizard. Use the Get Started button to begin configuration.', 'wp-ai-blogger')}
			</div>
		</main>
	);
});

WelcomeStep.displayName = 'WizardWelcomeStep';

export default WelcomeStep;
