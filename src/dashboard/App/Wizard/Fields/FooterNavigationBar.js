import React, { useRef, useCallback, useMemo, memo } from 'react';
import { __ } from '@wordpress/i18n';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react';
import { updateApiData } from '@Utils/ApiData';
import { useDispatch } from 'react-redux';

// Enhanced progress indicator component
const ProgressIndicator = memo(({ currentStep, maxSteps }) => {
	const progressPercentage = useMemo(() =>
		((currentStep + 1) / maxSteps) * 100,
		[currentStep, maxSteps]
	);

	return (
		<div className="flex items-center gap-3" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={maxSteps}>
			{/* Progress dots */}
			<div className="flex gap-2">
				{Array(maxSteps).fill().map((_, index) => (
					<div
						key={index}
						className={`
							w-3 h-3 rounded-full transition-all duration-300 ease-in-out
							${currentStep >= index ? 'bg-indigo-600 scale-110' : 'bg-gray-300'}
							${currentStep === index ? 'ring-2 ring-indigo-200 ring-offset-2' : ''}
						`}
						aria-label={__(`Step ${index + 1} ${currentStep >= index ? 'completed' : 'pending'}`, 'wp-ai-blogger')}
					/>
				))}
			</div>

			{/* Progress text */}
			<span className="text-sm text-gray-600 font-medium">
				{__(`${currentStep + 1} of ${maxSteps}`, 'wp-ai-blogger')}
			</span>
		</div>
	);
});

ProgressIndicator.displayName = 'WizardProgressIndicator';

// Enhanced navigation button component
const NavigationButton = memo(({
	onClick,
	children,
	variant = 'primary',
	disabled = false,
	loading = false,
	icon: Icon,
	ariaLabel
}) => {
	const baseClasses = "relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

	const variantClasses = {
		primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md",
		secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 shadow-sm",
		ghost: "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500"
	};

	const handleClick = useCallback((e) => {
		if (!disabled && !loading && onClick) {
			onClick(e);
		}
	}, [onClick, disabled, loading]);

	const handleKeyDown = useCallback((e) => {
		if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
			e.preventDefault();
			handleClick(e);
		}
	}, [handleClick, disabled, loading]);

	return (
		<button
			type="button"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			disabled={disabled || loading}
			className={`${baseClasses} ${variantClasses[variant]}`}
			aria-label={ariaLabel}
			aria-busy={loading}
		>
			{loading ? (
				<Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
			) : Icon ? (
				<Icon className="w-4 h-4" aria-hidden="true" />
			) : null}
			<span>{children}</span>
		</button>
	);
});

NavigationButton.displayName = 'WizardNavigationButton';

const FooterNavigationBar = memo((props) => {
	const abortControllerRef = useRef({});
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const { previousStep, nextStep, currentStep, maxSteps } = props;

	// Enhanced URL parameter handling
	const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const currentActiveStep = useMemo(() => query.get('step'), [query]);

	// State for loading and completion
	const [isNavigating, setIsNavigating] = React.useState(false);
	const [isCompleting, setIsCompleting] = React.useState(false);

	// Enhanced step navigation
	const handlePreviousStep = useCallback(async () => {
		if (previousStep === 'dashboard') return;

		setIsNavigating(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
			navigate(`${wpaib_localized_data.admin_app_url}&step=${previousStep}`);
		} finally {
			setIsNavigating(false);
		}
	}, [previousStep, navigate]);

	const handleNextStep = useCallback(async (e) => {
		e.preventDefault();

		if (nextStep) {
			setIsNavigating(true);
			try {
				await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
				navigate(`${wpaib_localized_data.admin_app_url}&step=${nextStep}`);
			} finally {
				setIsNavigating(false);
			}
			return;
		}

		// Handle completion step
		if (!nextStep && currentActiveStep === 'ready') {
			setIsCompleting(true);
			try {
				dispatch({ type: 'UPDATE_USER_ONBOARDED', payload: true });
				await updateApiData('userOnboarded', true, dispatch, abortControllerRef);
			} catch (error) {
				console.error('Failed to complete onboarding:', error);
			} finally {
				setIsCompleting(false);
			}
		}
	}, [nextStep, currentActiveStep, navigate, dispatch]);

	// Enhanced button text logic
	const getNextButtonText = useCallback(() => {
		const stepsToSkip = ['ready', 'optin'];

		if (nextStep && !stepsToSkip.includes(currentActiveStep)) {
			return __('Next', 'wp-ai-blogger');
		} else if (nextStep || currentActiveStep === 'optin') {
			return __('Skip', 'wp-ai-blogger');
		}
		return __('Finish Setup', 'wp-ai-blogger');
	}, [nextStep, currentActiveStep]);

	// Determine if previous button should be disabled
	const isPreviousDisabled = useMemo(() =>
		previousStep === 'dashboard' || isNavigating || isCompleting,
		[previousStep, isNavigating, isCompleting]
	);

	// Determine button variants and states
	const nextButtonVariant = useMemo(() => {
		if (!nextStep && currentActiveStep === 'ready') return 'primary';
		if (currentActiveStep === 'optin') return 'secondary';
		return 'primary';
	}, [nextStep, currentActiveStep]);

	return (
		<footer
			className="wpaib-setup-footer bg-white shadow-lg border-t border-gray-200 fixed right-0 left-[160px] bottom-0 h-[80px] z-20"
			role="contentinfo"
			aria-label={__('Setup wizard navigation', 'wp-ai-blogger')}
		>
			<div className="flex items-center justify-between max-w-4xl mx-auto px-8 h-full">
				{/* Previous button section */}
				<div className="flex-shrink-0">
					<NavigationButton
						onClick={handlePreviousStep}
						variant="ghost"
						disabled={isPreviousDisabled}
						loading={isNavigating && previousStep !== 'dashboard'}
						icon={ChevronLeft}
						ariaLabel={__('Go to previous step', 'wp-ai-blogger')}
					>
						{__('Back', 'wp-ai-blogger')}
					</NavigationButton>
				</div>

				{/* Progress indicator - centered */}
				<div className="flex-1 flex justify-center">
					<div className="hidden md:block">
						<ProgressIndicator
							currentStep={currentStep}
							maxSteps={maxSteps}
						/>
					</div>

					{/* Mobile progress text */}
					<div className="md:hidden">
						<span className="text-sm text-gray-600 font-medium">
							{__(`Step ${currentStep + 1} of ${maxSteps}`, 'wp-ai-blogger')}
						</span>
					</div>
				</div>

				{/* Next button section */}
				<div className="flex-shrink-0">
					<NavigationButton
						onClick={handleNextStep}
						variant={nextButtonVariant}
						loading={isNavigating || isCompleting}
						icon={!nextStep && currentActiveStep === 'ready' ? Check : ChevronRight}
						ariaLabel={__('Continue to next step', 'wp-ai-blogger')}
					>
						{isCompleting ? __('Completing...', 'wp-ai-blogger') : getNextButtonText()}
					</NavigationButton>
				</div>
			</div>

			{/* Screen reader announcements */}
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{isNavigating && __('Navigating to next step...', 'wp-ai-blogger')}
				{isCompleting && __('Completing setup process...', 'wp-ai-blogger')}
			</div>
		</footer>
	);
});

FooterNavigationBar.displayName = 'WizardFooterNavigationBar';

export default FooterNavigationBar;
