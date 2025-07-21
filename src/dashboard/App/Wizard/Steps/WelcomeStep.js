import React, { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';

// Enhanced feature card component with modern glass-morphism design
const FeatureCard = memo(({ icon: Icon, title, description }) => (
	<div className="group relative flex flex-col items-center p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/30 hover:border-blue-300/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
		{/* Card background glow effect */}
		<div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

		{/* Icon container with enhanced styling */}
		<div className="relative z-10 p-3 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl">
			<Icon className="w-7 h-7 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300" aria-hidden="true" />
		</div>

		{/* Content */}
		<div className="relative z-10 text-center">
			<h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
				{title}
			</h3>
			<p className="text-sm text-gray-600 leading-relaxed font-medium group-hover:text-gray-700 transition-colors duration-300">
				{description}
			</p>
		</div>
	</div>
));FeatureCard.displayName = 'WelcomeFeatureCard';

// Premium action button with advanced styling and animations
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
		<div className="relative inline-block">
			{/* Button glow effect */}
			<div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

			<button
				type="button"
				className="
					group relative inline-flex items-center gap-3 px-8 py-4
					bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
					hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700
					text-white font-bold text-lg rounded-2xl
					shadow-2xl hover:shadow-3xl
					focus:outline-none focus:ring-4 focus:ring-blue-300/50 focus:ring-offset-2
					transform transition-all duration-500 hover:scale-105 hover:-translate-y-1
					overflow-hidden border border-white/30
					backdrop-blur-sm
				"
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				aria-label={__("Start the setup wizard", 'wp-ai-blogger')}
			>
				{/* Animated background shimmer */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

				{/* Button content */}
				<span className="relative z-10 tracking-wide">{children}</span>
				{Icon && (
					<Icon className="relative z-10 w-5 h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" aria-hidden="true" />
				)}
			</button>
		</div>
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

	// Feature data - simplified and more focused
	const features = [
		{
			icon: Sparkles,
			title: __('AI Content Generation', 'wp-ai-blogger'),
			description: __('Create engaging blog posts automatically', 'wp-ai-blogger')
		},
		{
			icon: Zap,
			title: __('Quick Setup', 'wp-ai-blogger'),
			description: __('Ready in under 5 minutes', 'wp-ai-blogger')
		},
		{
			icon: Globe,
			title: __('Automated Scheduling', 'wp-ai-blogger'),
			description: __('Schedule AI-generated blog posts automatically', 'wp-ai-blogger')
		}
	];

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-6 relative overflow-hidden"
			role="main"
			aria-labelledby="welcome-heading"
		>
			{/* Enhanced background decorative elements */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
				<div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-200/25 to-pink-200/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

				{/* Floating particles */}
				<div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
				<div className="absolute top-40 right-32 w-3 h-3 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
				<div className="absolute bottom-32 left-40 w-2 h-2 bg-purple-400/40 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }} />
			</div>

			<div className="max-w-6xl mx-auto relative z-10">
				{/* Enhanced hero section */}
				<div className="text-center mb-20">
					{/* Step indicator with enhanced styling */}
					<div className="mb-10">
						<span className="inline-flex items-center px-8 py-4 bg-white/90 backdrop-blur-xl border border-indigo-200/50 text-indigo-700 text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
							<Sparkles className="w-5 h-5 mr-3 animate-pulse text-indigo-500" aria-hidden="true" />
							{__('Step 1 of 5', 'wp-ai-blogger')}
							<div className="ml-3 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
						</span>
					</div>

					{/* Enhanced main heading */}
					<h1
						id="welcome-heading"
						className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight"
					>
						{__('Turn Ideas Into', 'wp-ai-blogger')}
						<br />
						<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
							{__('AI-Powered Blogs', 'wp-ai-blogger')}
						</span>
					</h1>

					{/* Enhanced description with better typography */}
					<p className="text-lg text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed font-medium text-center">
						{__(
							"Generate high-quality blog content automatically. Boost your SEO and grow your audience with AI.",
							'wp-ai-blogger'
						)}
					</p>

					{/* Enhanced CTA section */}
					<div className="mb-16">
						<ActionButton
							onClick={handleStepRedirection}
							icon={ArrowRight}
						>
							{__("Start Building", 'wp-ai-blogger')}
						</ActionButton>

						{/* Additional CTA context */}
						<p className="mt-4 text-gray-500 font-medium text-sm">
							{__("No credit card required • Setup in minutes", 'wp-ai-blogger')}
						</p>
					</div>
				</div>

				{/* Enhanced features grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{features.map((feature, index) => (
						<FeatureCard
							key={index}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
						/>
					))}
				</div>

				{/* Enhanced footer info with better styling */}
				<div className="text-center">
					<div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm">
						<div className="flex items-center space-x-4 text-gray-600 font-semibold">
							<span className="flex items-center">
								<div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
								{__("5 min setup", 'wp-ai-blogger')}
							</span>
							<div className="w-1 h-1 bg-gray-400 rounded-full" />
							<span className="flex items-center">
								<div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse" />
								{__("No coding needed", 'wp-ai-blogger')}
							</span>
							<div className="w-1 h-1 bg-gray-400 rounded-full" />
							<span className="flex items-center">
								<div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse" />
								{__("AI-powered", 'wp-ai-blogger')}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Screen reader announcements */}
			<div className="sr-only" aria-live="polite">
				{__('Welcome to WP AI Blogger setup wizard. Use the Start Building button to begin.', 'wp-ai-blogger')}
			</div>
		</main>
	);
});

WelcomeStep.displayName = 'WizardWelcomeStep';

export default WelcomeStep;
