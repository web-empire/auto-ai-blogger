import React, { useState, useCallback, memo, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { RangeControl } from '@wordpress/components';
import { Thermometer, Shield, AlertTriangle, Info, Settings2 } from 'lucide-react';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import SettingInput from '@Components/SettingInput';

// Enhanced safety filter component
const SafetyFilterControl = memo(({
	id,
	title,
	description,
	value,
	onChange,
	icon: Icon,
	disabled = false
}) => {
	const blockLabels = useMemo(() => [
		__('Off', 'wp-ai-blogger'),
		__('Block none', 'wp-ai-blogger'),
		__('Block few', 'wp-ai-blogger'),
		__('Block some', 'wp-ai-blogger'),
		__('Block most', 'wp-ai-blogger'),
	], []);

	const getSeverityColor = (value) => {
		switch (value) {
			case 0: return 'text-gray-600 bg-gray-100';
			case 1: return 'text-green-600 bg-green-100';
			case 2: return 'text-yellow-600 bg-yellow-100';
			case 3: return 'text-orange-600 bg-orange-100';
			case 4: return 'text-red-600 bg-red-100';
			default: return 'text-gray-600 bg-gray-100';
		}
	};

	const marks = useMemo(() => [
		{ value: 0, label: blockLabels[0] },
		{ value: 1, label: '1' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
		{ value: 4, label: '4' },
	], [blockLabels]);

	return (
		<div className="p-4 border border-gray-200 rounded-lg bg-white">
			{/* Header with icon and title */}
			<div className="flex items-center gap-3 mb-3">
				<div className={`p-2 rounded-lg ${getSeverityColor(value)}`}>
					<Icon className="w-4 h-4" aria-hidden="true" />
				</div>
				<div className="flex-1">
					<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
					<p className="text-xs text-gray-600">{description}</p>
				</div>
				<div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(value)}`}>
					{blockLabels[value] || 'Unknown'}
				</div>
			</div>

			{/* Range control */}
			<div className="mt-3">
				<RangeControl
					value={value}
					onChange={onChange}
					min={0}
					max={4}
					step={1}
					withInputField={false}
					disabled={disabled}
					renderTooltipContent={(tooltipValue) => (
						<span className="text-sm font-medium">
							{blockLabels[tooltipValue] || ''}
						</span>
					)}
					marks={marks}
					aria-labelledby={`${id}-label`}
					aria-describedby={`${id}-description`}
				/>
			</div>
		</div>
	);
});

SafetyFilterControl.displayName = 'SafetyFilterControl';

// Enhanced temperature control component
const TemperatureControl = memo(({ value, onChange, disabled = false }) => {
	const getTemperatureLabel = (temp) => {
		if (temp <= 0.3) return __('Conservative', 'wp-ai-blogger');
		if (temp <= 0.7) return __('Balanced', 'wp-ai-blogger');
		if (temp <= 1.2) return __('Creative', 'wp-ai-blogger');
		if (temp <= 1.6) return __('Very Creative', 'wp-ai-blogger');
		return __('Experimental', 'wp-ai-blogger');
	};

	const getTemperatureColor = (temp) => {
		if (temp <= 0.3) return 'text-blue-600 bg-blue-100';
		if (temp <= 0.7) return 'text-green-600 bg-green-100';
		if (temp <= 1.2) return 'text-yellow-600 bg-yellow-100';
		if (temp <= 1.6) return 'text-orange-600 bg-orange-100';
		return 'text-red-600 bg-red-100';
	};

	return (
		<div className="p-4 border border-gray-200 rounded-lg bg-white">
			<div className="flex items-center gap-3 mb-3">
				<div className={`p-2 rounded-lg ${getTemperatureColor(value)}`}>
					<Thermometer className="w-4 h-4" aria-hidden="true" />
				</div>
				<div className="flex-1">
					<h3 className="text-sm font-semibold text-gray-900">
						{__('Creativity Temperature', 'wp-ai-blogger')}
					</h3>
					<p className="text-xs text-gray-600">
						{__('Controls randomness and creativity in content generation', 'wp-ai-blogger')}
					</p>
				</div>
				<div className={`px-2 py-1 rounded-full text-xs font-medium ${getTemperatureColor(value)}`}>
					{getTemperatureLabel(value)} ({value})
				</div>
			</div>

			<div className="mt-3">
				<RangeControl
					value={value}
					onChange={onChange}
					min={0}
					max={2}
					step={0.05}
					disabled={disabled}
					withInputField={false}
					renderTooltipContent={(temp) => (
						<span className="text-sm font-medium">
							{getTemperatureLabel(temp)} ({temp})
						</span>
					)}
					marks={[
						{ value: 0, label: '0' },
						{ value: 0.5, label: '0.5' },
						{ value: 1, label: '1' },
						{ value: 1.5, label: '1.5' },
						{ value: 2, label: '2' },
					]}
					aria-label={__('Content creativity level', 'wp-ai-blogger')}
				/>
			</div>

			{/* Temperature guide */}
			<div className="mt-3 text-xs text-gray-500 space-y-1">
				<div className="flex justify-between">
					<span>{__('More predictable', 'wp-ai-blogger')}</span>
					<span>{__('More creative', 'wp-ai-blogger')}</span>
				</div>
			</div>
		</div>
	);
});

TemperatureControl.displayName = 'TemperatureControl';

// Enhanced main component
const Persona = memo(() => {
	const dispatch = useDispatch();
	const [errors, setErrors] = useState({});

	// Redux selectors with proper fallbacks that allow 0 values
	const siteTitle = useSelector((state) => state?.siteTitle || '');
	const siteFor = useSelector((state) => state?.siteFor || '');
	const siteDescription = useSelector((state) => state?.siteDescription || '');
	const temperature = parseFloat(useSelector((state) => state?.temperature ?? 1.0));
	const harassment = parseInt(useSelector((state) => state?.harassment ?? 2));
	const hate = parseInt(useSelector((state) => state?.hate ?? 2));
	const sexuallyExplicit = parseInt(useSelector((state) => state?.sexuallyExplicit ?? 2));
	const dangerousContent = parseInt(useSelector((state) => state?.dangerousContent ?? 2));

	// Enhanced validation with better UX
	const validateSiteTitle = useCallback((value) => {
		const trimmedValue = value.trim();
		if (!trimmedValue) {
			setErrors(prev => ({ ...prev, siteTitle: __('Site title is required', 'wp-ai-blogger') }));
			return false;
		}
		if (trimmedValue.length > 100) {
			setErrors(prev => ({ ...prev, siteTitle: __('Site title must be 100 characters or less', 'wp-ai-blogger') }));
			return false;
		}
		setErrors(prev => ({ ...prev, siteTitle: null }));
		return true;
	}, []);

	const validateSiteFor = useCallback((value) => {
		const trimmedValue = value.trim();
		if (!trimmedValue) {
			setErrors(prev => ({ ...prev, siteFor: __('Site description is required', 'wp-ai-blogger') }));
			return false;
		}
		if (trimmedValue.length > 200) {
			setErrors(prev => ({ ...prev, siteFor: __('Description must be 200 characters or less', 'wp-ai-blogger') }));
			return false;
		}
		setErrors(prev => ({ ...prev, siteFor: null }));
		return true;
	}, []);

	// Optimized handlers - only update Redux state, let ContentHeader handle persistence
	const handleSiteTitleChange = useCallback((e) => {
		const value = e.target.value;
		dispatch({ type: 'UPDATE_SITE_TITLE', payload: value });
		// Immediate validation for better UX
		validateSiteTitle(value);
	}, [dispatch, validateSiteTitle]);

	const handleSiteForChange = useCallback((e) => {
		const value = e.target.value;
		dispatch({ type: 'UPDATE_SITE_FOR', payload: value });
		// Immediate validation for better UX
		validateSiteFor(value);
	}, [dispatch, validateSiteFor]);

	const handleSiteDescriptionChange = useCallback((e) => {
		const value = e.target.value;
		dispatch({ type: 'UPDATE_SITE_DESCRIPTION', payload: value });
	}, [dispatch]);

	const handleTemperatureChange = useCallback((value) => {
		// Ensure value is within valid range and properly formatted
		const clampedValue = Math.max(0, Math.min(2, parseFloat(value) || 1.0));
		dispatch({ type: 'UPDATE_TEMPERATURE', payload: clampedValue });
	}, [dispatch]);

	const handleHarassmentChange = useCallback((value) => {
		const clampedValue = Math.max(0, Math.min(4, parseInt(value) ?? 2));
		dispatch({ type: 'UPDATE_HARASSMENT', payload: clampedValue });
	}, [dispatch]);

	const handleHateChange = useCallback((value) => {
		const clampedValue = Math.max(0, Math.min(4, parseInt(value) ?? 2));
		dispatch({ type: 'UPDATE_HATE', payload: clampedValue });
	}, [dispatch]);

	const handleSexuallyExplicitChange = useCallback((value) => {
		const clampedValue = Math.max(0, Math.min(4, parseInt(value) ?? 2));
		dispatch({ type: 'UPDATE_SEXUALLY_EXPLICIT', payload: clampedValue });
	}, [dispatch]);

	const handleDangerousContentChange = useCallback((value) => {
		const clampedValue = Math.max(0, Math.min(4, parseInt(value) ?? 2));
		dispatch({ type: 'UPDATE_DANGEROUS_CONTENT', payload: clampedValue });
	}, [dispatch]);

	// Optimized character count with bounds checking
	const descriptionCount = siteDescription.length;
	const maxDescriptionLength = 1000;
	const descriptionProgress = Math.min(100, (descriptionCount / maxDescriptionLength) * 100);
	const isDescriptionNearLimit = descriptionProgress > 90;

	return (
		<div className="space-y-8">
			{/* Enhanced header */}
			<div className="flex items-center gap-3 pb-4 border-b border-gray-200">
				<div className="p-2 bg-purple-100 rounded-lg">
					<Settings2 className="w-5 h-5 text-purple-600" aria-hidden="true" />
				</div>
				<div>
					<h2 className="text-xl font-bold text-gray-900">
						{__('Content Persona Settings', 'wp-ai-blogger')}
					</h2>
					<p className="text-gray-600 text-sm">
						{__('Configure your site profile and AI content generation parameters', 'wp-ai-blogger')}
					</p>
				</div>
			</div>

			{/* Site information section */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
					<Info className="w-5 h-5 text-blue-600" />
					{__('Site Information', 'wp-ai-blogger')}
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<SettingField>
						<SettingLabel
							forId="name-of-the-blog"
							title={__('Site Title', 'wp-ai-blogger')}
							required={true}
						/>
						<SettingInput
							id="name-of-the-blog"
							value={siteTitle}
							onChange={handleSiteTitleChange}
							placeholder={__('Enter your site title', 'wp-ai-blogger')}
							maxLength={100}
							aria-describedby="site-title-error"
							className={errors.siteTitle ? 'border-red-300 focus:ring-red-500' : ''}
						/>
						{errors.siteTitle && (
							<p id="site-title-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
								<AlertTriangle className="w-3 h-3" />
								{errors.siteTitle}
							</p>
						)}
						<p className="text-xs text-gray-500 mt-1">
							{siteTitle.length}/100 characters
						</p>
					</SettingField>

					<SettingField>
						<SettingLabel
							forId="blog-for"
							title={__('Site Description', 'wp-ai-blogger')}
							required={true}
						/>
						<SettingInput
							id="blog-for"
							value={siteFor}
							onChange={handleSiteForChange}
							placeholder={__('Brief description of your site', 'wp-ai-blogger')}
							maxLength={200}
							aria-describedby="site-for-error"
							className={errors.siteFor ? 'border-red-300 focus:ring-red-500' : ''}
						/>
						{errors.siteFor && (
							<p id="site-for-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
								<AlertTriangle className="w-3 h-3" />
								{errors.siteFor}
							</p>
						)}
						<p className="text-xs text-gray-500 mt-1">
							{siteFor.length}/200 characters
						</p>
					</SettingField>
				</div>
			</div>

			{/* AI generation parameters */}
			<div className="space-y-6">
				<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
					<Thermometer className="w-5 h-5 text-orange-600" />
					{__('AI Generation Parameters', 'wp-ai-blogger')}
				</h3>

				{/* Temperature control */}
				<TemperatureControl
					value={temperature}
					onChange={handleTemperatureChange}
				/>

				{/* Safety filters */}
				<h4 className="text-md font-semibold text-gray-900 flex items-center gap-2 mt-8">
					<Shield className="w-5 h-5 text-green-600" />
					{__('Content Safety Filters', 'wp-ai-blogger')}
				</h4>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<SafetyFilterControl
						id="harassment"
						title={__('Harassment Filter', 'wp-ai-blogger')}
						description={__('Blocks harassing or bullying content', 'wp-ai-blogger')}
						value={harassment}
						onChange={handleHarassmentChange}
						icon={Shield}
					/>

					<SafetyFilterControl
						id="hate"
						title={__('Hate Speech Filter', 'wp-ai-blogger')}
						description={__('Blocks hateful or discriminatory content', 'wp-ai-blogger')}
						value={hate}
						onChange={handleHateChange}
						icon={AlertTriangle}
					/>

					<SafetyFilterControl
						id="sexually-explicit"
						title={__('Adult Content Filter', 'wp-ai-blogger')}
						description={__('Blocks sexually explicit content', 'wp-ai-blogger')}
						value={sexuallyExplicit}
						onChange={handleSexuallyExplicitChange}
						icon={Shield}
					/>

					<SafetyFilterControl
						id="dangerous-content"
						title={__('Dangerous Content Filter', 'wp-ai-blogger')}
						description={__('Blocks potentially harmful instructions', 'wp-ai-blogger')}
						value={dangerousContent}
						onChange={handleDangerousContentChange}
						icon={AlertTriangle}
					/>
				</div>

				{/* Safety info box */}
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
					<div className="flex items-start gap-3">
						<Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
						<div>
							<h4 className="text-sm font-medium text-green-900 mb-1">
								{__('Safety Filter Guidelines', 'wp-ai-blogger')}
							</h4>
							<p className="text-sm text-green-700">
								{__('Higher filter levels provide stronger content moderation but may be more restrictive. Adjust based on your content requirements and audience.', 'wp-ai-blogger')}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Detailed site description */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-gray-900">
					{__('Detailed Site Information', 'wp-ai-blogger')}
				</h3>

				<SettingField>
					<SettingLabel
						forId="more-about-blog"
						title={__('Tell us more about your site', 'wp-ai-blogger')}
					/>
					<div className="relative">
						<textarea
							id="more-about-blog"
							value={siteDescription}
							onChange={handleSiteDescriptionChange}
							className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm resize-vertical"
							rows={6}
							maxLength={maxDescriptionLength}
							placeholder={__('Provide detailed information about your site, target audience, content style, and any specific requirements...', 'wp-ai-blogger')}
							aria-describedby="description-count"
						/>
						<div className={`absolute bottom-2 right-3 text-xs px-1 bg-white rounded ${isDescriptionNearLimit ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
							{descriptionCount}/{maxDescriptionLength}
						</div>
					</div>
					<p id="description-count" className="text-xs text-gray-500 mt-1">
						{__('This information helps AI generate more relevant and targeted content for your audience.', 'wp-ai-blogger')}
					</p>
				</SettingField>
			</div>

			{/* Screen reader summary */}
			<div className="sr-only" aria-live="polite">
				{__(`Persona settings updated: Temperature ${temperature}, Harassment filter ${harassment}, Hate filter ${hate}, Adult content filter ${sexuallyExplicit}, Dangerous content filter ${dangerousContent}`, 'wp-ai-blogger')}
			</div>
		</div>
	);
});

Persona.displayName = 'PersonaSettings';

export default Persona;
