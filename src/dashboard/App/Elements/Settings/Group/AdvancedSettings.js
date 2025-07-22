import React, { useState, useCallback, memo, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { RangeControl } from '@wordpress/components';
import { Thermometer, Shield, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import DynamicCard from '@Components/DynamicCard';

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

// Main Advanced Settings component
const AdvancedSettings = memo(() => {
	const dispatch = useDispatch();
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

	// Redux selectors
	const temperature = useSelector((state) => state.temperature);
	const harassment = useSelector((state) => state.harassment);
	const hate = useSelector((state) => state.hate);
	const sexuallyExplicit = useSelector((state) => state.sexuallyExplicit);
	const dangerousContent = useSelector((state) => state.dangerousContent);

	// Handlers
	const handleTemperatureChange = useCallback((value) => {
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

	return (
		<div className="space-y-4">
			{/* Accordion Header */}
			<div className="border border-gray-200 rounded-lg bg-white">
				<button
					type="button"
					onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
					className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
					aria-expanded={isAdvancedOpen}
					aria-controls="advanced-settings-content"
				>
					<DynamicCard
						icon={Thermometer}
						heading={__('Advanced AI Settings', 'wp-ai-blogger')}
						subHeading={__('Configure creativity temperature and content safety filters', 'wp-ai-blogger')}
						colorScheme="orange"
						size="medium"
						className="!cursor-pointer"
						onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
						aria-expanded={isAdvancedOpen}
						aria-controls="advanced-settings-content"
					/>
					<div className="flex-shrink-0">
						{isAdvancedOpen ? (
							<ChevronUp className="w-5 h-5 text-gray-500" />
						) : (
							<ChevronDown className="w-5 h-5 text-gray-500" />
						)}
					</div>
				</button>

				{/* Accordion Content */}
				{isAdvancedOpen && (
					<div
						id="advanced-settings-content"
						className="px-4 pb-4 space-y-6 border-t border-gray-100"
					>
						{/* Temperature control */}
						<div className="pt-4">
							<TemperatureControl
								value={temperature}
								onChange={handleTemperatureChange}
							/>
						</div>

						{/* Safety filters */}
						<div className="space-y-4">
							<h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
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
					</div>
				)}
			</div>

			{/* Screen reader summary */}
			<div className="sr-only" aria-live="polite">
				{__(`Advanced AI settings updated: Temperature ${temperature}, Harassment filter ${harassment}, Hate filter ${hate}, Adult content filter ${sexuallyExplicit}, Dangerous content filter ${dangerousContent}`, 'wp-ai-blogger')}
			</div>
		</div>
	);
});

AdvancedSettings.displayName = 'AdvancedAISettings';

export default AdvancedSettings;
