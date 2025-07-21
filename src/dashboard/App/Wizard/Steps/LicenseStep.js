import React, { useState, useRef, useCallback, memo } from 'react';
import { __ } from '@wordpress/i18n';
import { ArrowRight, Key, CheckCircle2, AlertCircle, ExternalLink, Shield, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateApiData } from '@Utils/ApiData';
import apiFetch from '@wordpress/api-fetch';

// Enhanced license input component
const LicenseInput = memo(({ value, onChange, error, disabled, processing }) => {
	const [isFocused, setIsFocused] = useState(false);

	const handleFocus = useCallback(() => setIsFocused(true), []);
	const handleBlur = useCallback(() => setIsFocused(false), []);

	return (
		<div className="space-y-2">
			<label
				htmlFor="wpaib-license"
				className="flex items-center gap-2 text-sm font-semibold text-gray-900"
			>
				<Key className="w-4 h-4 text-gray-600" aria-hidden="true" />
				{__('License Key', 'wp-ai-blogger')}
				<span className="text-red-500" aria-label={__('Required', 'wp-ai-blogger')}>*</span>
			</label>

			<div className="relative">
				<input
					id="wpaib-license"
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
					disabled={disabled}
					placeholder={__('Enter your license key here...', 'wp-ai-blogger')}
					className={`
						w-full pl-4 pr-10 py-3 text-sm border rounded-lg transition-all duration-200
						${error
							? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
							: 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500'
						}
						${isFocused ? 'shadow-md' : 'shadow-sm'}
						${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
						focus:outline-none focus:ring-2 focus:ring-opacity-50
						placeholder:text-gray-400
					`}
					aria-describedby={error ? 'license-error' : undefined}
					aria-invalid={!!error}
				/>

				{/* Status indicator */}
				<div className="absolute right-3 top-3">
					{processing ? (
						<Loader2 className="w-4 h-4 text-indigo-500 animate-spin" aria-hidden="true" />
					) : error ? (
						<AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
					) : value && !error ? (
						<CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" />
					) : null}
				</div>
			</div>

			{error && (
				<p id="license-error" className="text-xs text-red-600 flex items-center gap-1">
					<AlertCircle className="w-3 h-3" />
					{error}
				</p>
			)}
		</div>
	);
});

LicenseInput.displayName = 'LicenseInput';

// Enhanced call-to-action component
const GetLicenseCard = memo(() => (
	<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
		<div className="flex items-center gap-3 mb-3">
			<div className="p-2 bg-blue-100 rounded-lg">
				<Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
			</div>
			<div>
				<h3 className="text-sm font-semibold text-gray-900">
					{__('No License Key?', 'wp-ai-blogger')}
				</h3>
				<p className="text-xs text-gray-600">
					{__('Get started with free credits today', 'wp-ai-blogger')}
				</p>
			</div>
		</div>
		<a
			href={upgradeLink}
			target="_blank"
			rel="noopener noreferrer"
			className="
				inline-flex items-center gap-2 text-sm font-medium text-blue-600
				hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
				focus:ring-offset-2 rounded transition-colors duration-200
			"
			aria-label={__('Get free credits - opens in new tab', 'wp-ai-blogger')}
		>
			{__('Get Free Credits', 'wp-ai-blogger')}
			<ExternalLink className="w-3 h-3" aria-hidden="true" />
		</a>
	</div>
));

GetLicenseCard.displayName = 'GetLicenseCard';

// Enhanced submit button
const SubmitButton = memo(({ onClick, disabled, loading, children }) => {
	const handleClick = useCallback((e) => {
		e.preventDefault();
		if (!disabled && !loading) {
			onClick();
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
			aria-label={__('Activate license and continue', 'wp-ai-blogger')}
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

SubmitButton.displayName = 'LicenseSubmitButton';

const LicenseStep = memo(() => {
	const abortControllerRef = useRef({});
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Redux state
	const reduxLicense = useSelector((state) => state.license);
	const ajaxUrl = useSelector((state) => state.ajaxUrl) || '/wp-admin/admin-ajax.php';
	const licensingNonce = useSelector((state) => state.licensingNonce);
	const upgradeLink = useSelector((state) => state.upgradeLink);
	const adminAppUrl = useSelector((state) => state.adminAppUrl);
	const licenseStatusFromRedux = useSelector((state) => state.licenseStatus);

	// Component state
	const [license, setLicense] = useState(() => {
		// Ensure we always have a string value
		const initialLicense = reduxLicense || '';
		return typeof initialLicense === 'string' ? initialLicense : '';
	});
	const [licenseStatus, setLicenseStatus] = useState(licenseStatusFromRedux);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState('');

	// Enhanced token fetching in background
	const fetchTokenDataInBackground = useCallback(async (licenseKey) => {
		try {
			console.log('Fetching token data in background for license:', licenseKey.substring(0, 8) + '...');

			const tokenResponse = await fetch(`https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data?license=${licenseKey}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (tokenResponse.ok) {
				const tokenData = await tokenResponse.json();

				if (tokenData && tokenData.success && tokenData.data) {
					// Update Redux store with token data
					dispatch({
						type: 'UPDATE_TOKEN_TOTAL',
						payload: tokenData.data.total,
					});
					dispatch({
						type: 'UPDATE_TOKEN_REMAINING',
						payload: tokenData.data.remaining,
					});

					// Update API data in database
					await updateApiData('tokenTotal', tokenData.data.total, dispatch, abortControllerRef);
					await updateApiData('tokenRemaining', tokenData.data.remaining, dispatch, abortControllerRef);

					console.log('Token data fetched and updated:', tokenData.data);

					// Show success notification
					dispatch({
						type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
						payload: {
							message: __('License activated and token data updated successfully!', 'wp-ai-blogger'),
							type: 'success',
							duration: 4000,
						},
					});
				} else {
					console.warn('Invalid token data response:', tokenData);
					dispatch({
						type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
						payload: {
							message: __('License activated but failed to fetch token data', 'wp-ai-blogger'),
							type: 'warning',
							duration: 4000,
						},
					});
				}
			} else {
				console.warn('Failed to fetch token data, status:', tokenResponse.status);
				dispatch({
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: {
						message: __('License activated but token fetch failed', 'wp-ai-blogger'),
						type: 'warning',
						duration: 4000,
					},
				});
			}
		} catch (tokenError) {
			console.error('Token data fetch error:', tokenError);
			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: {
					message: __('License activated but token fetch failed', 'wp-ai-blogger'),
					type: 'warning',
					duration: 4000,
				},
			});
		}
	}, [dispatch]);

	// Enhanced license activation
	const activateLicense = useCallback(async () => {
		// Ensure license is a string and not empty
		const licenseValue = typeof license === 'string' ? license.trim() : '';
		if (!licenseValue || processing) return false;

		// Validate nonce is available
		if (!licensingNonce) {
			console.error('LicenseStep: No licensing nonce available', { licensingNonce });
			setError(__('Security verification failed. Please refresh the page and try again.', 'wp-ai-blogger'));
			return false;
		}

		setProcessing(true);
		setError('');

		// Debug logging
		if (process.env.NODE_ENV === 'development') {
			console.log('LicenseStep: Activating license', {
				licenseValue: licenseValue.substring(0, 8) + '...',
				licensingNonce: licensingNonce.substring(0, 8) + '...',
				ajaxUrl
			});
		}

		try {
			const formData = new FormData();
			formData.append('action', 'wp_ai_blogger_activate_license');
			formData.append('license_key', licenseValue);
			formData.append('wp_ai_blogger_licensing_nonce', licensingNonce);

			const response = await apiFetch({
				url: ajaxUrl,
				method: 'POST',
				body: formData,
				timeout: 30000
			});

			if (response.success) {
				// Update Redux state
				dispatch({
					type: 'UPDATE_LICENSE_STATUS',
					payload: 'licensed',
				});
				dispatch({ type: 'UPDATE_LICENSE', payload: licenseValue });

				setLicenseStatus('licensed');

				// Update API data
				await updateApiData('license', licenseValue, dispatch, abortControllerRef);

				// Fetch token data in background after successful activation
				fetchTokenDataInBackground(licenseValue);

				return true;
			} else {
				// Handle specific error types
				const errorMessage = response.data?.message || response.message || '';
				console.error('License activation failed:', response);

				if (errorMessage.includes('nonce') || errorMessage.includes('security')) {
					setError(__('Security verification failed. Please refresh the page and try again.', 'wp-ai-blogger'));
				} else if (errorMessage.includes('license') || errorMessage.includes('key')) {
					setError(__('Invalid license key. Please check your license key and try again.', 'wp-ai-blogger'));
				} else {
					setError(errorMessage || __('License activation failed. Please check your license key.', 'wp-ai-blogger'));
				}
				return false;
			}
		} catch (error) {
			console.error('License activation error:', error);
			setError(__('Connection failed. Please check your internet connection and try again.', 'wp-ai-blogger'));
			return false;
		} finally {
			setProcessing(false);
		}
	}, [license, processing, licensingNonce, dispatch, ajaxUrl]);

	// Enhanced form submission
	const handleSubmit = useCallback(async () => {
		// Ensure license is a string and not empty
		const licenseValue = typeof license === 'string' ? license.trim() : '';
		if (!licenseValue) {
			setError(__('License key is required.', 'wp-ai-blogger'));
			return;
		}

		const success = await activateLicense();
		if (success) {
			// Small delay for better UX
			setTimeout(() => {
				navigate(`${adminAppUrl}&step=optin`);
			}, 1000);
		}
	}, [license, activateLicense, navigate]);

	// Handle license input change
	const handleLicenseChange = useCallback((value) => {
		// Ensure we always set a string value
		const stringValue = typeof value === 'string' ? value : '';
		setLicense(stringValue);
		if (error) setError(''); // Clear error when user types
	}, [error]);

	// Button text logic
	const getButtonText = () => {
		if (processing) {
			return licenseStatus === 'licensed' ? __('Proceeding...', 'wp-ai-blogger') : __('Activating...', 'wp-ai-blogger');
		}
		return __('Activate & Continue', 'wp-ai-blogger');
	};

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4"
			role="main"
			aria-labelledby="license-heading"
		>
			<div className="w-full max-w-2xl">
				<div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
						<div className="mb-4">
							<span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white text-sm font-medium rounded-full tracking-wide uppercase">
								<Shield className="w-4 h-4 mr-2" aria-hidden="true" />
								{__('Step 3 of 5', 'wp-ai-blogger')}
							</span>
						</div>
						<h1 id="license-heading" className="text-3xl font-bold text-white mb-2">
							{__('Activate Your License', 'wp-ai-blogger')}
						</h1>
						<p className="text-indigo-100 text-lg">
							{__('Connect your site to unlock AI-powered content generation with your license key.', 'wp-ai-blogger')}
						</p>
					</div>

					{/* Form */}
					<div className="p-8">
						<form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
							<LicenseInput
								value={license}
								onChange={handleLicenseChange}
								error={error}
								disabled={processing}
								processing={processing}
							/>

							<GetLicenseCard />

							{/* Success message */}
							{licenseStatus === 'licensed' && !error && (
								<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
										<p className="text-green-800 font-medium">
											{__('License activated successfully!', 'wp-ai-blogger')}
										</p>
									</div>
								</div>
							)}

							{/* Submit button */}
							<div className="flex justify-center pt-4">
								<SubmitButton
									onClick={handleSubmit}
									disabled={!(typeof license === 'string' && license.trim())}
									loading={processing}
								>
									{getButtonText()}
								</SubmitButton>
							</div>
						</form>

						{/* Additional info */}
						<div className="mt-8 text-center">
							<p className="text-sm text-gray-600 leading-relaxed">
								{__('Your license key connects your site to our AI services and allocates content generation tokens. ', 'wp-ai-blogger')}
								<a
									href={upgradeLink}
									target="_blank"
									rel="noopener noreferrer"
									className="text-indigo-600 hover:text-indigo-700 underline"
								>
									{__('Learn more about licensing', 'wp-ai-blogger')}
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Screen reader announcements */}
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{processing && __('Activating your license...', 'wp-ai-blogger')}
				{licenseStatus === 'licensed' && __('License activated successfully. Proceeding to next step.', 'wp-ai-blogger')}
				{error && __(`License activation failed: ${error}`, 'wp-ai-blogger')}
			</div>
		</main>
	);
});

LicenseStep.displayName = 'WizardLicenseStep';

export default LicenseStep;
