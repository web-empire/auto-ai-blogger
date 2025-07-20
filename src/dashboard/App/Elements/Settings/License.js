import React, { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch, useSelector } from 'react-redux';
import SettingsContainer from '@Components/SettingsContainer';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import { Key, Shield, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Tooltip } from '@wordpress/components';
import { updateApiData } from '@Utils/ApiData';

// Enhanced license activation form
const LicenseForm = memo(({
	licenseKey,
	setLicenseKey,
	activated,
	processing,
	activationText,
	deactivationText,
	onActivate,
	onDeactivate
}) => {
	const handleKeyPress = useCallback((e) => {
		if (e.key === 'Enter' && !activated && licenseKey.trim() && !processing) {
			e.preventDefault();
			onActivate();
		}
	}, [activated, licenseKey, processing, onActivate]);

	return (
		<div className="space-y-4">
			<SettingLabel
				forId="license-key"
				title={__('License Key', 'wp-ai-blogger')}
				description={!activated ? __('Enter your license key to unlock premium features', 'wp-ai-blogger') : undefined}
			/>

			<div className="flex gap-3">
				<div className="relative flex-1">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Key className="h-4 w-4 text-gray-400" aria-hidden="true" />
					</div>

					<input
						id="license-key"
						name="license-key"
						type="text"
						value={licenseKey}
						disabled={activated}
						onChange={(e) => setLicenseKey(e.target.value.trim())}
						onKeyPress={handleKeyPress}
						placeholder={
							activated
								? __('License is active', 'wp-ai-blogger')
								: __('Enter your license key...', 'wp-ai-blogger')
						}
						className={`
							block w-full !pl-12 pr-3 py-2.5 text-sm
							border border-gray-300 rounded-lg
							bg-white text-gray-900
							placeholder:text-gray-400
							focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
							transition-colors duration-200
							${activated ? 'bg-gray-50 text-gray-500' : ''}
							${processing ? 'opacity-70' : ''}
						`}
						aria-describedby={activated ? "license-status" : "license-help"}
					/>
				</div>

				{activated ? (
					<button
						type="button"
						onClick={onDeactivate}
						disabled={processing}
						className={`
							inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
							bg-white border border-gray-300 rounded-lg
							text-gray-700 hover:text-gray-900 hover:bg-gray-50
							focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
							transition-all duration-200
							${processing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
						`}
						aria-label={__('Deactivate license', 'wp-ai-blogger')}
					>
						{processing && <Loader2 className="w-4 h-4 animate-spin" />}
						{deactivationText}
					</button>
				) : (
					<button
						type="button"
						onClick={onActivate}
						disabled={!licenseKey.trim() || processing}
						className={`
							inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
							bg-indigo-600 text-white rounded-lg
							hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
							transition-all duration-200 transform hover:scale-105
							${(!licenseKey.trim() || processing) ? 'opacity-70 cursor-not-allowed hover:scale-100' : 'cursor-pointer shadow-sm'}
						`}
						aria-label={__('Activate license', 'wp-ai-blogger')}
					>
						{processing && <Loader2 className="w-4 h-4 animate-spin" />}
						{!processing && <Shield className="w-4 h-4" />}
						{activationText}
					</button>
				)}
			</div>

			{!activated && (
				<p id="license-help" className="text-xs text-gray-500">
					{__('Don\'t have a license? ', 'wp-ai-blogger')}
					<a
						href={upgradeLink}
						target="_blank"
						rel="noopener noreferrer"
						className="text-indigo-600 hover:text-indigo-800 underline"
					>
						{__('Get one here', 'wp-ai-blogger')}
					</a>
				</p>
			)}
		</div>
	);
});

LicenseForm.displayName = 'LicenseForm';

// Main License component
const License = memo(() => {
	const dispatch = useDispatch();
	const abortControllerRef = useRef({});

	// Redux selectors with fallbacks
	const licenseStatus = useSelector((state) => state.license_status) || 'unlicensed';
	const license = useSelector((state) => state.license) || '';
	const upgradeLink = useSelector((state) => state.upgradeLink) || '#';
	const licensingNonce = useSelector((state) => state.licensingNonce) || '';
	const ajaxUrl = useSelector((state) => state.ajaxUrl) || '/wp-admin/admin-ajax.php';

	// Local state
	const [processing, setProcessing] = useState(false);
	const [licenseKey, setLicenseKey] = useState('');
	const [activationText, setActivationText] = useState(__('Activate', 'wp-ai-blogger'));
	const [deactivationText, setDeactivationText] = useState(__('Deactivate', 'wp-ai-blogger'));

	// Computed values
	const activated = useMemo(() => licenseStatus === 'licensed', [licenseStatus]);

	// Cleanup effect
	useEffect(() => {
		return () => {
			// Cancel any ongoing requests
			Object.values(abortControllerRef.current).forEach(controller => {
				if (controller && typeof controller.abort === 'function') {
					controller.abort();
				}
			});
		};
	}, []);

	// Enhanced license activation with better error handling
	const activateLicense = useCallback(async () => {
		if (!licenseKey.trim() || processing) return;

		setActivationText(__('Activating...', 'wp-ai-blogger'));
		setProcessing(true);

		// Create abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current['activation'] = abortController;

		try {
			const formData = new FormData();
			formData.append('action', 'wp_ai_blogger_activate_license');
			formData.append('license_key', licenseKey);
			formData.append('wp_ai_blogger_licensing_nonce', licensingNonce);

			const response = await apiFetch({
				url: ajaxUrl,
				method: 'POST',
				body: formData,
				signal: abortController.signal
			});

			if (!response.success) {
				throw new Error(response?.data?.message || __('License activation failed', 'wp-ai-blogger'));
			}

			// Update license status
			dispatch({
				type: 'UPDATE_LICENSE_STATUS',
				payload: 'licensed',
			});

			// Also update the license key in Redux for token fetching
			dispatch({
				type: 'UPDATE_LICENSE',
				payload: licenseKey,
			});

			console.log('License key set in Redux:', licenseKey);

			// Fetch token data immediately after successful activation
			try {
				const tokenResponse = await fetch(`https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data?license=${licenseKey}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					signal: abortController.signal
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
					}
				} else {
					console.warn('Failed to fetch token data after license activation');
				}
			} catch (tokenError) {
				// Don't fail the license activation if token fetch fails
				console.warn('Token data fetch error after license activation:', tokenError);
			}

			setActivationText(__('Activated', 'wp-ai-blogger'));
			setLicenseKey('');

			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __('License activated successfully!', 'wp-ai-blogger'),
			});
		} catch (error) {
			if (error.name === 'AbortError') return;

			console.error('License activation error:', error);

			setActivationText(__('Activate', 'wp-ai-blogger'));
			dispatch({
				type: 'UPDATE_LICENSE_STATUS',
				payload: 'unlicensed',
			});
			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: error.message || __('Failed to activate license', 'wp-ai-blogger'),
			});
		} finally {
			setProcessing(false);
			delete abortControllerRef.current['activation'];
		}
	}, [licenseKey, processing, dispatch]);

	// Enhanced license deactivation
	const deactivateLicense = useCallback(async () => {
		if (processing) return;

		setDeactivationText(__('Deactivating...', 'wp-ai-blogger'));
		setProcessing(true);

		// Create abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current['deactivation'] = abortController;

		try {
			const formData = new FormData();
			formData.append('action', 'wp_ai_blogger_deactivate_license');
			formData.append('wp_ai_blogger_licensing_nonce', licensingNonce);

			const response = await apiFetch({
				url: ajaxUrl,
				method: 'POST',
				body: formData,
				signal: abortController.signal
			});

			if (response.success) {
				setLicenseKey('');
				dispatch({
					type: 'UPDATE_LICENSE_STATUS',
					payload: 'unlicensed',
				});
				dispatch({
					type: 'UPDATE_LICENSE',
					payload: '',
				});

				setDeactivationText(__('Deactivated', 'wp-ai-blogger'));
				setActivationText(__('Activate', 'wp-ai-blogger'));
			}

			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: response?.data?.message || __('License deactivated', 'wp-ai-blogger'),
			});
		} catch (error) {
			if (error.name === 'AbortError') return;

			console.error('Deactivation error:', error);
			setDeactivationText(__('Deactivate', 'wp-ai-blogger'));
		} finally {
			setProcessing(false);
			delete abortControllerRef.current['deactivation'];
		}
	}, [processing, dispatch]);

	// Reset button states when activation status changes
	useEffect(() => {
		if (activated) {
			setActivationText(__('Activated', 'wp-ai-blogger'));
			setDeactivationText(__('Deactivate', 'wp-ai-blogger'));
		} else {
			setActivationText(__('Activate', 'wp-ai-blogger'));
			setDeactivationText(__('Deactivated', 'wp-ai-blogger'));
		}
	}, [activated]);

	return (
		<div className="space-y-6">
			{/* Enhanced header */}
			<div className="flex items-center gap-3 pb-4 border-b border-gray-200">
				<div className="p-2 bg-indigo-100 rounded-lg">
					<Zap className="w-5 h-5 text-indigo-600" aria-hidden="true" />
				</div>
				<div>
					<h2 className="text-xl font-bold text-gray-900">
						{__('License Management', 'wp-ai-blogger')}
					</h2>
					<p className="text-gray-600 text-sm">
						{__('Activate your license to unlock premium AI features', 'wp-ai-blogger')}
					</p>
				</div>
			</div>

			{/* Settings container */}
			<SettingsContainer
				title={__('License Configuration', 'wp-ai-blogger')}
				description={__('Activate your license to unlock premium AI features and token access.', 'wp-ai-blogger')}
				element={
					<LicenseForm
						licenseKey={licenseKey}
						setLicenseKey={setLicenseKey}
						activated={activated}
						processing={processing}
						activationText={activationText}
						deactivationText={deactivationText}
						onActivate={activateLicense}
						onDeactivate={deactivateLicense}
					/>
				}
				className="bg-white shadow-sm rounded-lg border border-gray-200"
			/>

			{/* Screen reader status */}
			<div className="sr-only" aria-live="polite">
				{activated
					? __('License is active', 'wp-ai-blogger')
					: __('No active license', 'wp-ai-blogger')
				}
			</div>
		</div>
	);
});

License.displayName = 'LicenseSettings';

export default License;
