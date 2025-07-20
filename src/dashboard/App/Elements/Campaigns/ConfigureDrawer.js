import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { __ } from '@wordpress/i18n';
import {
	X,
	Save,
	ChevronDown,
	ChevronRight,
	Info,
	Settings,
	Calendar,
	FileText,
	Target,
	Zap,
	AlertCircle,
	CheckCircle
} from 'lucide-react';
import SettingField from '@Components/SettingField';
import SwitchControl from '@Components/SwitchControl';
import { updateCampaign } from '@Utils/ApiData';

// Enhanced field group component
const FieldGroup = memo(({ title, description, icon: Icon, children, isOpen = true, onToggle }) => (
	<div className="border border-gray-200 rounded-lg overflow-hidden">
		<button
			type="button"
			onClick={onToggle}
			className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
			aria-expanded={isOpen}
		>
			<div className="flex items-center gap-3">
				{Icon && <Icon className="w-5 h-5 text-gray-600" aria-hidden="true" />}
				<div>
					<h3 className="text-sm font-medium text-gray-900">{title}</h3>
					{description && (
						<p className="text-xs text-gray-500 mt-1">{description}</p>
					)}
				</div>
			</div>
			{isOpen ? (
				<ChevronDown className="w-4 h-4 text-gray-500" />
			) : (
				<ChevronRight className="w-4 h-4 text-gray-500" />
			)}
		</button>

		{isOpen && (
			<div className="p-4 space-y-4 bg-white">
				{children}
			</div>
		)}
	</div>
));

FieldGroup.displayName = 'CampaignFieldGroup';

// Enhanced status indicator component
const StatusIndicator = memo(({ type, message }) => {
	const styles = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};

	const icons = {
		success: CheckCircle,
		error: AlertCircle,
		warning: AlertCircle,
		info: Info
	};

	const Icon = icons[type] || Info;

	return (
		<div className={`flex items-center gap-2 p-3 rounded-lg border ${styles[type]}`}>
			<Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
			<span className="text-sm font-medium">{message}</span>
		</div>
	);
});

StatusIndicator.displayName = 'CampaignStatusIndicator';

// Main ConfigureDrawer component
export const ConfigureDrawer = memo(({ openDrawer, setOpenDrawer, configureData }) => {
	// State management
	const [formData, setFormData] = useState({});
	const [expandedSections, setExpandedSections] = useState({
		basic: true,
		content: true,
		scheduling: true,
		advanced: false
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [submitStatus, setSubmitStatus] = useState(null);

	// Memoized post types with safety check
	const postTypes = useMemo(() => {
		if (typeof wpaib_localized_data === 'undefined' || !wpaib_localized_data) {
			return {};
		}
		return wpaib_localized_data.post_types || {};
	}, []);

	// Initialize form data when configureData changes
	useEffect(() => {
		if (configureData && Object.keys(configureData).length > 0) {
			setFormData({
				name: configureData.name || '',
				description: configureData.description || '',
				post_type: configureData.post_type || 'post',
				posts_number: configureData.posts_number || 5,
				posts_frequency: configureData.posts_frequency || 'daily',
				content_structure: configureData.content_structure || 'default',
				seo_optimization: configureData.seo_optimization || false,
				auto_publish: configureData.auto_publish || false,
				use_featured_images: configureData.use_featured_images || false,
				content_length: configureData.content_length || 'medium',
				writing_style: configureData.writing_style || 'professional',
				target_keywords: configureData.target_keywords || '',
				categories: configureData.categories || [],
				tags: configureData.tags || [],
				...configureData
			});
		}
	}, [configureData]);

	// Clear status after a delay
	useEffect(() => {
		if (submitStatus) {
			const timer = setTimeout(() => {
				setSubmitStatus(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [submitStatus]);

	// Form validation
	const validateForm = useCallback((data) => {
		const errors = {};

		if (!data.name || data.name.trim().length < 3) {
			errors.name = __('Campaign name must be at least 3 characters long', 'wp-ai-blogger');
		}

		if (!data.posts_number || data.posts_number < 1 || data.posts_number > 100) {
			errors.posts_number = __('Number of posts must be between 1 and 100', 'wp-ai-blogger');
		}

		if (!data.post_type) {
			errors.post_type = __('Please select a post type', 'wp-ai-blogger');
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	}, []);

	// Handle input changes
	const handleInputChange = useCallback((field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));

		// Clear validation error for this field
		if (validationErrors[field]) {
			setValidationErrors(prev => ({
				...prev,
				[field]: undefined
			}));
		}
	}, [validationErrors]);

	// Toggle section expansion
	const toggleSection = useCallback((section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	}, []);

	// Handle form submission
	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();

		if (!validateForm(formData)) {
			setSubmitStatus({
				type: 'error',
				message: __('Please fix the validation errors before submitting', 'wp-ai-blogger')
			});
			return;
		}

		setIsSubmitting(true);
		setSubmitStatus(null);

		try {
			const isNew = configureData?.type === 'create';
			const response = await updateCampaign(formData, isNew);

			if (response?.success) {
				setSubmitStatus({
					type: 'success',
					message: isNew
						? __('Campaign created successfully!', 'wp-ai-blogger')
						: __('Campaign updated successfully!', 'wp-ai-blogger')
				});

				// Close drawer after a short delay
				setTimeout(() => {
					setOpenDrawer(false);
				}, 1500);
			}
		} catch (error) {
			console.error('Campaign save error:', error);
			setSubmitStatus({
				type: 'error',
				message: error.message || __('Failed to save campaign. Please try again.', 'wp-ai-blogger')
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, configureData, validateForm, setOpenDrawer]);

	// Handle drawer close
	const handleClose = useCallback(() => {
		if (isSubmitting) return;

		setOpenDrawer(false);
		setSubmitStatus(null);
		setValidationErrors({});
	}, [isSubmitting, setOpenDrawer]);

	// Don't render if drawer is closed
	if (!openDrawer) return null;

	return (
		<div
			className="fixed inset-0 z-50 overflow-hidden"
			role="dialog"
			aria-modal="true"
			aria-labelledby="drawer-title"
		>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				onClick={handleClose}
				aria-hidden="true"
			/>

			{/* Drawer */}
			<div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform">
				<div className="flex h-full flex-col">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
						<div className="flex items-center gap-3">
							<Settings className="w-5 h-5 text-gray-600" aria-hidden="true" />
							<div>
								<h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
									{configureData?.type === 'create'
										? __('Create New Campaign', 'wp-ai-blogger')
										: __('Configure Campaign', 'wp-ai-blogger')
									}
								</h2>
								<p className="text-sm text-gray-600">
									{__('Set up your automated content generation campaign', 'wp-ai-blogger')}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={handleClose}
							disabled={isSubmitting}
							className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
							aria-label={__('Close configure drawer', 'wp-ai-blogger')}
						>
							<X className="w-5 h-5" aria-hidden="true" />
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto">
						<form onSubmit={handleSubmit} className="p-6 space-y-6">
							{/* Status indicator */}
							{submitStatus && (
								<StatusIndicator
									type={submitStatus.type}
									message={submitStatus.message}
								/>
							)}

							{/* Basic Information */}
							<FieldGroup
								title={__('Basic Information', 'wp-ai-blogger')}
								description={__('Campaign name and description', 'wp-ai-blogger')}
								icon={FileText}
								isOpen={expandedSections.basic}
								onToggle={() => toggleSection('basic')}
							>
								<SettingField
									label={__('Campaign Name', 'wp-ai-blogger')}
									description={__('A descriptive name for your campaign', 'wp-ai-blogger')}
									required
								>
									<input
										type="text"
										value={formData.name || ''}
										onChange={(e) => handleInputChange('name', e.target.value)}
										className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
											validationErrors.name ? 'border-red-500' : ''
										}`}
										placeholder={__('Enter campaign name...', 'wp-ai-blogger')}
										disabled={isSubmitting}
									/>
									{validationErrors.name && (
										<p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
									)}
								</SettingField>

								<SettingField
									label={__('Description', 'wp-ai-blogger')}
									description={__('Optional description of what this campaign will generate', 'wp-ai-blogger')}
								>
									<textarea
										rows={3}
										value={formData.description || ''}
										onChange={(e) => handleInputChange('description', e.target.value)}
										className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										placeholder={__('Describe your campaign...', 'wp-ai-blogger')}
										disabled={isSubmitting}
									/>
								</SettingField>
							</FieldGroup>

							{/* Content Settings */}
							<FieldGroup
								title={__('Content Settings', 'wp-ai-blogger')}
								description={__('Configure what type of content to generate', 'wp-ai-blogger')}
								icon={Target}
								isOpen={expandedSections.content}
								onToggle={() => toggleSection('content')}
							>
								<SettingField
									label={__('Post Type', 'wp-ai-blogger')}
									description={__('Select the type of content to create', 'wp-ai-blogger')}
									required
								>
									<select
										value={formData.post_type || 'post'}
										onChange={(e) => handleInputChange('post_type', e.target.value)}
										className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
											validationErrors.post_type ? 'border-red-500' : ''
										}`}
										disabled={isSubmitting}
									>
										{Object.entries(postTypes).map(([value, label]) => (
											<option key={value} value={value}>
												{label}
											</option>
										))}
									</select>
									{validationErrors.post_type && (
										<p className="mt-1 text-sm text-red-600">{validationErrors.post_type}</p>
									)}
								</SettingField>

								<SettingField
									label={__('Number of Posts', 'wp-ai-blogger')}
									description={__('How many posts to generate in this campaign', 'wp-ai-blogger')}
									required
								>
									<input
										type="number"
										min="1"
										max="100"
										value={formData.posts_number || 5}
										onChange={(e) => handleInputChange('posts_number', parseInt(e.target.value) || 1)}
										className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
											validationErrors.posts_number ? 'border-red-500' : ''
										}`}
										disabled={isSubmitting}
									/>
									{validationErrors.posts_number && (
										<p className="mt-1 text-sm text-red-600">{validationErrors.posts_number}</p>
									)}
								</SettingField>

								<SettingField
									label={__('Content Length', 'wp-ai-blogger')}
									description={__('Target length for generated content', 'wp-ai-blogger')}
								>
									<select
										value={formData.content_length || 'medium'}
										onChange={(e) => handleInputChange('content_length', e.target.value)}
										className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										disabled={isSubmitting}
									>
										<option value="short">{__('Short (300-500 words)', 'wp-ai-blogger')}</option>
										<option value="medium">{__('Medium (500-800 words)', 'wp-ai-blogger')}</option>
										<option value="long">{__('Long (800-1200 words)', 'wp-ai-blogger')}</option>
									</select>
								</SettingField>

								<SettingField
									label={__('Writing Style', 'wp-ai-blogger')}
									description={__('Tone and style for the generated content', 'wp-ai-blogger')}
								>
									<select
										value={formData.writing_style || 'professional'}
										onChange={(e) => handleInputChange('writing_style', e.target.value)}
										className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										disabled={isSubmitting}
									>
										<option value="professional">{__('Professional', 'wp-ai-blogger')}</option>
										<option value="casual">{__('Casual', 'wp-ai-blogger')}</option>
										<option value="friendly">{__('Friendly', 'wp-ai-blogger')}</option>
										<option value="authoritative">{__('Authoritative', 'wp-ai-blogger')}</option>
									</select>
								</SettingField>
							</FieldGroup>

							{/* Scheduling */}
							<FieldGroup
								title={__('Scheduling', 'wp-ai-blogger')}
								description={__('When and how often to generate content', 'wp-ai-blogger')}
								icon={Calendar}
								isOpen={expandedSections.scheduling}
								onToggle={() => toggleSection('scheduling')}
							>
								<SettingField
									label={__('Frequency', 'wp-ai-blogger')}
									description={__('How often to generate new posts', 'wp-ai-blogger')}
								>
									<select
										value={formData.posts_frequency || 'daily'}
										onChange={(e) => handleInputChange('posts_frequency', e.target.value)}
										className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										disabled={isSubmitting}
									>
										<option value="hourly">{__('Hourly', 'wp-ai-blogger')}</option>
										<option value="daily">{__('Daily', 'wp-ai-blogger')}</option>
										<option value="weekly">{__('Weekly', 'wp-ai-blogger')}</option>
										<option value="monthly">{__('Monthly', 'wp-ai-blogger')}</option>
									</select>
								</SettingField>

								<SettingField
									label={__('Auto Publish', 'wp-ai-blogger')}
									description={__('Automatically publish posts when generated', 'wp-ai-blogger')}
								>
									<SwitchControl
										checked={formData.auto_publish || false}
										onChange={(checked) => handleInputChange('auto_publish', checked)}
										disabled={isSubmitting}
									/>
								</SettingField>
							</FieldGroup>

							{/* Advanced Settings */}
							<FieldGroup
								title={__('Advanced Settings', 'wp-ai-blogger')}
								description={__('Additional options and optimizations', 'wp-ai-blogger')}
								icon={Zap}
								isOpen={expandedSections.advanced}
								onToggle={() => toggleSection('advanced')}
							>
								<SettingField
									label={__('SEO Optimization', 'wp-ai-blogger')}
									description={__('Include SEO-optimized titles and meta descriptions', 'wp-ai-blogger')}
								>
									<SwitchControl
										checked={formData.seo_optimization || false}
										onChange={(checked) => handleInputChange('seo_optimization', checked)}
										disabled={isSubmitting}
									/>
								</SettingField>

								<SettingField
									label={__('Featured Images', 'wp-ai-blogger')}
									description={__('Generate and add featured images to posts', 'wp-ai-blogger')}
								>
									<SwitchControl
										checked={formData.use_featured_images || false}
										onChange={(checked) => handleInputChange('use_featured_images', checked)}
										disabled={isSubmitting}
									/>
								</SettingField>

								<SettingField
									label={__('Target Keywords', 'wp-ai-blogger')}
									description={__('Comma-separated keywords to focus on', 'wp-ai-blogger')}
								>
									<input
										type="text"
										value={formData.target_keywords || ''}
										onChange={(e) => handleInputChange('target_keywords', e.target.value)}
										className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										placeholder={__('keyword1, keyword2, keyword3', 'wp-ai-blogger')}
										disabled={isSubmitting}
									/>
								</SettingField>
							</FieldGroup>
						</form>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
						<button
							type="button"
							onClick={handleClose}
							disabled={isSubmitting}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						>
							{__('Cancel', 'wp-ai-blogger')}
						</button>

						<button
							type="submit"
							onClick={handleSubmit}
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						>
							{isSubmitting ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									{__('Saving...', 'wp-ai-blogger')}
								</>
							) : (
								<>
									<Save className="w-4 h-4" aria-hidden="true" />
									{configureData?.type === 'create'
										? __('Create Campaign', 'wp-ai-blogger')
										: __('Save Changes', 'wp-ai-blogger')
									}
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});

ConfigureDrawer.displayName = 'ConfigureDrawer';

export default ConfigureDrawer;
