import React, { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { ArrowRight, AlertCircle, CheckCircle2, User, Globe, FileText, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateApiData } from '@Utils/ApiData';

// Enhanced form field component
const FormField = memo(({
	id,
	label,
	type = 'text',
	value,
	onChange,
	error,
	placeholder,
	maxLength,
	rows,
	icon: Icon,
	required = false,
	description
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [charCount, setCharCount] = useState(value?.length || 0);

	const handleChange = useCallback((e) => {
		const newValue = e.target.value;
		onChange(newValue);
		setCharCount(newValue.length);
	}, [onChange]);

	const handleFocus = useCallback(() => setIsFocused(true), []);
	const handleBlur = useCallback(() => setIsFocused(false), []);

	const fieldClasses = `
		w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200
		${error
			? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
			: 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500'
		}
		${isFocused ? 'shadow-md' : 'shadow-sm'}
		focus:outline-none focus:ring-2 focus:ring-opacity-50
		placeholder:text-gray-400
	`;

	return (
		<div className="space-y-2">
			<label
				htmlFor={id}
				className="flex items-center gap-2 text-sm font-semibold text-gray-900"
			>
				{Icon && <Icon className="w-4 h-4 text-gray-600" aria-hidden="true" />}
				{label}
				{required && <span className="text-red-500" aria-label={__('Required', 'wp-ai-blogger')}>*</span>}
			</label>

			{description && (
				<p className="text-xs text-gray-600 mb-2">{description}</p>
			)}

			<div className="relative">
				{type === 'textarea' ? (
					<textarea
						id={id}
						value={value}
						onChange={handleChange}
						onFocus={handleFocus}
						onBlur={handleBlur}
						placeholder={placeholder}
						maxLength={maxLength}
						rows={rows || 4}
						className={fieldClasses}
						aria-describedby={error ? `${id}-error` : undefined}
						aria-invalid={!!error}
					/>
				) : (
					<input
						id={id}
						type={type}
						value={value}
						onChange={handleChange}
						onFocus={handleFocus}
						onBlur={handleBlur}
						placeholder={placeholder}
						maxLength={maxLength}
						className={fieldClasses}
						aria-describedby={error ? `${id}-error` : undefined}
						aria-invalid={!!error}
					/>
				)}

				{/* Status indicator */}
				<div className="absolute right-3 top-3">
					{error ? (
						<AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
					) : value && !error ? (
						<CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
					) : null}
				</div>
			</div>

			{/* Character count */}
			{maxLength && (
				<div className="flex justify-between items-center text-xs">
					<span className={`${error ? 'text-red-600' : 'text-gray-500'}`}>
						{error && (
							<span id={`${id}-error`} className="flex items-center gap-1">
								<AlertCircle className="w-3 h-3" />
								{error}
							</span>
						)}
					</span>
					<span className={`${charCount > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
						{charCount}/{maxLength}
					</span>
				</div>
			)}

			{/* Error message without character count */}
			{error && !maxLength && (
				<p id={`${id}-error`} className="text-xs text-red-600 flex items-center gap-1">
					<AlertCircle className="w-3 h-3" />
					{error}
				</p>
			)}
		</div>
	);
});

FormField.displayName = 'PersonaFormField';

// Enhanced submit button component
const SubmitButton = memo(({ onClick, loading, disabled, children }) => {
	const handleClick = useCallback((e) => {
		e.preventDefault();
		if (!disabled && !loading) {
			onClick(e);
		}
	}, [onClick, disabled, loading]);

	return (
		<button
			type="submit"
			onClick={handleClick}
			disabled={disabled || loading}
			className="
				group inline-flex items-center gap-3 px-8 py-4
				bg-gradient-to-r from-indigo-600 to-purple-600
				text-white font-semibold rounded-xl shadow-lg
				hover:from-indigo-700 hover:to-purple-700
				focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
				transform transition-all duration-200 hover:scale-105 hover:shadow-xl
				disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
			"
			aria-label={__('Continue to next step', 'wp-ai-blogger')}
		>
			{loading ? (
				<Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
			) : (
				<span>{children}</span>
			)}
			{!loading && (
				<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
			)}
		</button>
	);
});

SubmitButton.displayName = 'PersonaSubmitButton';

const PersonaFormStep = memo(() => {
	const abortControllerRef = useRef({});
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Redux selectors with safe fallbacks
	const reduxSiteTitle = useSelector((state) => state?.siteTitle || '');
	const reduxSiteFor = useSelector((state) => state?.siteFor || '');
	const reduxSiteDescription = useSelector((state) => state?.siteDescription || '');

	// Enhanced form state with fallback chain
	const [formData, setFormData] = useState({
		siteTitle: reduxSiteTitle || wpaib_localized_data?.site_title || '',
		siteFor: reduxSiteFor || wpaib_localized_data?.site_for || '',
		siteDescription: reduxSiteDescription || wpaib_localized_data?.site_description || '',
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Sync form data with Redux state changes
	useEffect(() => {
		setFormData(prev => ({
			...prev,
			siteTitle: reduxSiteTitle || wpaib_localized_data?.site_title || prev.siteTitle,
			siteFor: reduxSiteFor || wpaib_localized_data?.site_for || prev.siteFor,
			siteDescription: reduxSiteDescription || wpaib_localized_data?.site_description || prev.siteDescription,
		}));
	}, [reduxSiteTitle, reduxSiteFor, reduxSiteDescription]);

	// Cleanup function for abort controllers
	useEffect(() => {
		return () => {
			// Cancel any pending API requests when component unmounts
			Object.values(abortControllerRef.current).forEach(controller => {
				if (controller && typeof controller.abort === 'function') {
					controller.abort();
				}
			});
		};
	}, []);

	// Enhanced validation with better error messages
	const validateForm = useCallback(() => {
		const newErrors = {};

		// Validate siteTitle
		const trimmedTitle = formData.siteTitle?.trim() || '';
		if (!trimmedTitle) {
			newErrors.siteTitle = __('Site title is required', 'wp-ai-blogger');
		} else if (trimmedTitle.length < 3) {
			newErrors.siteTitle = __('Site title must be at least 3 characters', 'wp-ai-blogger');
		} else if (trimmedTitle.length > 100) {
			newErrors.siteTitle = __('Site title must be less than 100 characters', 'wp-ai-blogger');
		}

		// Validate siteFor
		const trimmedFor = formData.siteFor?.trim() || '';
		if (!trimmedFor) {
			newErrors.siteFor = __('Site purpose is required', 'wp-ai-blogger');
		} else if (trimmedFor.length < 10) {
			newErrors.siteFor = __('Please provide a more detailed description (at least 10 characters)', 'wp-ai-blogger');
		} else if (trimmedFor.length > 200) {
			newErrors.siteFor = __('Site purpose must be less than 200 characters', 'wp-ai-blogger');
		}

		// Validate siteDescription
		const trimmedDescription = formData.siteDescription?.trim() || '';
		if (!trimmedDescription) {
			newErrors.siteDescription = __('Site description is required', 'wp-ai-blogger');
		} else if (trimmedDescription.length < 20) {
			newErrors.siteDescription = __('Please provide a more detailed description (at least 20 characters)', 'wp-ai-blogger');
		} else if (trimmedDescription.length > 1000) {
			newErrors.siteDescription = __('Site description must be less than 1000 characters', 'wp-ai-blogger');
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData]);

	// Form field handlers with enhanced validation
	const handleFieldChange = useCallback((field) => (value) => {
		// Sanitize input value
		const sanitizedValue = typeof value === 'string' ? value : String(value || '');

		setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

		// Clear error when user starts typing and provide real-time validation
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}

		// Real-time validation for better UX
		if (field === 'siteTitle' && sanitizedValue.trim() && sanitizedValue.length >= 3) {
			setErrors(prev => ({ ...prev, siteTitle: '' }));
		}
		if (field === 'siteFor' && sanitizedValue.trim() && sanitizedValue.length >= 10) {
			setErrors(prev => ({ ...prev, siteFor: '' }));
		}
		if (field === 'siteDescription' && sanitizedValue.trim() && sanitizedValue.length >= 20) {
			setErrors(prev => ({ ...prev, siteDescription: '' }));
		}
	}, [errors]);

	// Enhanced form submission
	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Update Redux state with validation
			if (formData.siteTitle?.trim()) {
				dispatch({ type: 'UPDATE_SITE_TITLE', payload: formData.siteTitle.trim() });
			}
			if (formData.siteFor?.trim()) {
				dispatch({ type: 'UPDATE_SITE_FOR', payload: formData.siteFor.trim() });
			}
			if (formData.siteDescription?.trim()) {
				dispatch({ type: 'UPDATE_SITE_DESCRIPTION', payload: formData.siteDescription.trim() });
			}

			// Update API data with error handling for each field
			const apiPromises = [];

			if (formData.siteTitle?.trim()) {
				apiPromises.push(
					updateApiData('siteTitle', formData.siteTitle.trim(), dispatch, abortControllerRef)
						.catch(error => {
							console.error('Failed to save siteTitle:', error);
							throw new Error(__('Failed to save site title', 'wp-ai-blogger'));
						})
				);
			}

			if (formData.siteFor?.trim()) {
				apiPromises.push(
					updateApiData('siteFor', formData.siteFor.trim(), dispatch, abortControllerRef)
						.catch(error => {
							console.error('Failed to save siteFor:', error);
							throw new Error(__('Failed to save site purpose', 'wp-ai-blogger'));
						})
				);
			}

			if (formData.siteDescription?.trim()) {
				apiPromises.push(
					updateApiData('siteDescription', formData.siteDescription.trim(), dispatch, abortControllerRef)
						.catch(error => {
							console.error('Failed to save siteDescription:', error);
							throw new Error(__('Failed to save site description', 'wp-ai-blogger'));
						})
				);
			}

			// Wait for all API calls to complete
			await Promise.all(apiPromises);

			// Navigate to next step
			navigate(`${wpaib_localized_data.admin_app_url}&step=license`);
		} catch (error) {
			console.error('Form submission error:', error);
			setErrors({ submit: __('Failed to save your information. Please try again.', 'wp-ai-blogger') });
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, validateForm, dispatch, navigate]);

	// Form completion percentage
	const completionPercentage = useMemo(() => {
		const fields = ['siteTitle', 'siteFor', 'siteDescription'];
		const filledFields = fields.filter(field => formData[field].trim().length > 0);
		return Math.round((filledFields.length / fields.length) * 100);
	}, [formData]);

	return (
		<main
			className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
			role="main"
			aria-labelledby="persona-heading"
		>
			<div className="w-full max-w-6xl">
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
					{/* Header */}
					<div className="p-6 text-center border-b border-gray-200">
						<div className="mb-3">
							<span className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full tracking-wide uppercase">
								<User className="w-4 h-4 mr-2" aria-hidden="true" />
								{__('Step 2 of 5', 'wp-ai-blogger')}
							</span>
						</div>
						<h1 id="persona-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
							{__('Tell Us About Your Site', 'wp-ai-blogger')}
						</h1>

						{/* Progress bar */}
						<div className="mt-4">
							<div className="bg-gray-200 rounded-full h-2 overflow-hidden">
								<div
									className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500 ease-out"
									style={{ width: `${completionPercentage}%` }}
									role="progressbar"
									aria-valuenow={completionPercentage}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-label={__(`Form completion: ${completionPercentage}%`, 'wp-ai-blogger')}
								/>
							</div>
							<p className="text-gray-600 text-sm mt-1">
								{__(`${completionPercentage}% complete`, 'wp-ai-blogger')}
							</p>
						</div>
					</div>

					{/* Form */}
					<form className="p-6 md:p-8" onSubmit={handleSubmit} noValidate>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div className="space-y-5">
								<FormField
									id="wpaib-site-title"
									label={__('Site Title', 'wp-ai-blogger')}
									value={formData.siteTitle}
									onChange={handleFieldChange('siteTitle')}
									error={errors.siteTitle}
									placeholder={__('e.g., Tech Insights Blog, Travel Adventures', 'wp-ai-blogger')}
									maxLength={100}
									icon={Globe}
									required
									description={__('The main title of your website or blog', 'wp-ai-blogger')}
								/>

								<FormField
									id="wpaib-site-for"
									label={__('Site Purpose', 'wp-ai-blogger')}
									value={formData.siteFor}
									onChange={handleFieldChange('siteFor')}
									error={errors.siteFor}
									placeholder={__('e.g., technology enthusiasts, travel lovers', 'wp-ai-blogger')}
									maxLength={200}
									icon={User}
									required
									description={__('Who is your target audience?', 'wp-ai-blogger')}
								/>
							</div>

							<div className="space-y-5">
								<FormField
									id="wpaib-site-description"
									label={__('Detailed Description', 'wp-ai-blogger')}
									type="textarea"
									value={formData.siteDescription}
									onChange={handleFieldChange('siteDescription')}
									error={errors.siteDescription}
									placeholder={__('Describe your site: topics, style, audience, goals...', 'wp-ai-blogger')}
									maxLength={1000}
									rows={8}
									icon={FileText}
									required
									description={__('Help AI understand your content needs', 'wp-ai-blogger')}
								/>
							</div>
						</div>

						{/* Submit error */}
						{errors.submit && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-700 text-sm flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									{errors.submit}
								</p>
							</div>
						)}

						{/* Submit button */}
						<div className="flex justify-center pt-6">
							<SubmitButton
								onClick={handleSubmit}
								loading={isSubmitting}
								disabled={Object.keys(errors).length > 0 && !errors.submit}
							>
								{isSubmitting ? __('Saving...', 'wp-ai-blogger') : __('Continue', 'wp-ai-blogger')}
							</SubmitButton>
						</div>
					</form>
				</div>

				{/* Help text */}
				<div className="text-center mt-4">
					<p className="text-sm text-gray-600">
						{__('This information will be used to configure your AI content generator for optimal results.', 'wp-ai-blogger')}
					</p>
				</div>
			</div>

			{/* Screen reader announcements */}
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{isSubmitting && __('Saving your site information...', 'wp-ai-blogger')}
				{Object.keys(errors).length > 0 && __('Please fix the form errors before continuing.', 'wp-ai-blogger')}
			</div>
		</main>
	);
});

PersonaFormStep.displayName = 'WizardPersonaFormStep';

export default PersonaFormStep;
