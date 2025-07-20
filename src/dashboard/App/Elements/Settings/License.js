import React, { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch, useSelector } from 'react-redux';
import SettingsContainer from '@Components/SettingsContainer';
import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';
import { RefreshCw, Key, Shield, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Tooltip } from '@wordpress/components';
import { updateApiData } from '@Utils/ApiData';

// Enhanced license status component
const LicenseStatus = memo(({ status, tokensUsed, totalTokens, onRefresh, isRefreshing }) => {
	const statusConfig = useMemo(() => {
		switch (status) {
			case 'licensed':
				return {
					icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
					text: __('Active License', 'wp-ai-blogger'),
					bgColor: 'bg-green-50',
					textColor: 'text-green-800',
					borderColor: 'border-green-200'
				};
			default:
				return {
					icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
					text: __('No Active License', 'wp-ai-blogger'),
					bgColor: 'bg-amber-50',
					textColor: 'text-amber-800',
					borderColor: 'border-amber-200'
				};
		}
	}, [status]);

	const usagePercentage = useMemo(() => {
		if (!totalTokens || totalTokens === 0) return 0;
		return Math.min((tokensUsed / totalTokens) * 100, 100);
	}, [tokensUsed, totalTokens]);

	return (
		<div className={`p-4 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					{statusConfig.icon}
					<span className={`font-medium ${statusConfig.textColor}`}>
						{statusConfig.text}
					</span>
				</div>

				<button
					type="button"
					onClick={onRefresh}
					disabled={status === 'licensed' ? false : true}
					className={`p-1 ${status === 'licensed' ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800 hover:bg-green-100'} rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1`}
					aria-label={__('Refresh token data', 'wp-ai-blogger')}
				>
					<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
				</button>
			</div>

			<div className="space-y-2 transition-opacity duration-200">
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">
						{__('Tokens Used', 'wp-ai-blogger')}
					</span>
					<span className="font-medium text-gray-900">
						{tokensUsed.toLocaleString()} / {totalTokens.toLocaleString()}
					</span>
				</div>

				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className={`h-2 rounded-full transition-all duration-300 ${
							usagePercentage > 90 ? 'bg-red-500' :
							usagePercentage > 75 ? 'bg-amber-500' : 'bg-green-500'
						}`}
						style={{ width: `${usagePercentage}%` }}
						role="progressbar"
						aria-valuenow={usagePercentage}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={__(`Token usage: ${usagePercentage.toFixed(1)}%`, 'wp-ai-blogger')}
					/>
				</div>

				<p className="text-xs text-gray-500">
					{status === 'licensed' ? (
						<>
							{usagePercentage > 90 && __('⚠️ Running low on tokens', 'wp-ai-blogger')}
							{usagePercentage <= 90 && usagePercentage > 75 && __('📊 Moderate usage', 'wp-ai-blogger')}
							{usagePercentage <= 75 && __('✅ Plenty of tokens available', 'wp-ai-blogger')}
						</>
					) : (
						__('🔑 Activate license to access tokens', 'wp-ai-blogger')
					)}
				</p>
			</div>
		</div>
	);
});

LicenseStatus.displayName = 'LicenseStatus';

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
						href={(typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.upgrade_link) || '#'}
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
	const tokenTotal = useSelector((state) => state.tokenTotal) || 0;
	const tokenRemaining = useSelector((state) => state.tokenRemaining) || 0;
	const license = useSelector((state) => state.license) || '';

	// Local state
	const [processing, setProcessing] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [licenseKey, setLicenseKey] = useState('');
	const [activationText, setActivationText] = useState(__('Activate', 'wp-ai-blogger'));
	const [deactivationText, setDeactivationText] = useState(__('Deactivate', 'wp-ai-blogger'));
	const [isTokenFetching, setIsTokenFetching] = useState(false);

	// Local token state to prevent Redux conflicts
	const [localTokenData, setLocalTokenData] = useState({
		total: 0,
		remaining: 0,
		lastUpdated: null
	});

	// Initialize and sync local token data from Redux
	useEffect(() => {
		// Always sync token data from Redux state, regardless of activation status
		setLocalTokenData({
			total: tokenTotal,
			remaining: tokenRemaining,
			lastUpdated: new Date().toISOString()
		});
	}, [tokenTotal, tokenRemaining]);

	// Computed values
	const activated = useMemo(() => licenseStatus === 'licensed', [licenseStatus]);

	// Use Redux state as primary source, with local state as enhancement for real-time updates
	const displayTokenTotal = useMemo(() => {
		// If we have fresh local data that's different from Redux, use it
		if (localTokenData.lastUpdated && localTokenData.total !== tokenTotal) {
			return localTokenData.total;
		}
		// Otherwise, always use Redux state as source of truth
		return tokenTotal;
	}, [localTokenData.total, localTokenData.lastUpdated, tokenTotal]);

	const displayTokenRemaining = useMemo(() => {
		// If we have fresh local data that's different from Redux, use it
		if (localTokenData.lastUpdated && localTokenData.remaining !== tokenRemaining) {
			return localTokenData.remaining;
		}
		// Otherwise, always use Redux state as source of truth
		return tokenRemaining;
	}, [localTokenData.remaining, localTokenData.lastUpdated, tokenRemaining]);

	const tokensUsed = useMemo(() =>
		activated ? displayTokenTotal - displayTokenRemaining : 0,
		[activated, displayTokenTotal, displayTokenRemaining]
	);

	// Function to fetch token data from external API
	const fetchTokenData = useCallback(async () => {
		if (!license) {
			console.log('No license available for token fetch:', license);
			return;
		}

		// Prevent multiple simultaneous token fetches and don't interfere with license operations
		if (isTokenFetching || processing) {
			console.log('Token fetch skipped - already in progress or license operation active');
			return;
		}

		console.log('Fetching token data for license:', license);
		setIsTokenFetching(true);

		try {
			const response = await fetch(
				`https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data?license=${license}`,
				{
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const tokenData = await response.json();

			if (tokenData?.success && tokenData?.data) {
				console.log('TOKEN TOTAL:', tokenData.data.total);
				console.log('TOKEN REMAINING:', tokenData.data.remaining);

				// Store the data for later use
				const fetchedData = {
					total: tokenData.data.total,
					remaining: tokenData.data.remaining
				};

				// Step 1: Update local state first for immediate UI feedback
				setLocalTokenData({
					total: fetchedData.total,
					remaining: fetchedData.remaining,
					lastUpdated: new Date().toISOString()
				});

				// Step 2: Sequential Redux updates to prevent conflicts
				dispatch({
					type: 'UPDATE_TOKEN_TOTAL',
					payload: fetchedData.total,
				});

				dispatch({
					type: 'UPDATE_TOKEN_REMAINING',
					payload: fetchedData.remaining,
				});

				// Step 3: Sequential backend updates with proper awaiting
				try {
					console.log('Attempting to save tokenTotal:', fetchedData.total);
					await updateApiData('tokenTotal', fetchedData.total, dispatch);
					console.log('Successfully saved tokenTotal');

					console.log('Attempting to save tokenRemaining:', fetchedData.remaining);
					await updateApiData('tokenRemaining', fetchedData.remaining, dispatch);
					console.log('Successfully saved tokenRemaining');
				} catch (saveError) {
					console.error('Backend save failed (non-critical):', saveError);
					// Don't throw error here - token data was successfully fetched and UI updated
				}

				// Return success - token data was fetched successfully
				return { success: true, data: tokenData.data };
			} else {
				throw new Error(__('Invalid response from token API', 'wp-ai-blogger'));
			}
		} catch (error) {
			console.error('Token fetch error:', error);
			throw error;
		} finally {
			// Reset the flag after operations complete
			setIsTokenFetching(false);
		}
	}, [license, dispatch, isTokenFetching, processing]);

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
			formData.append('wp_ai_blogger_licensing_nonce', (typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.licensing_nonce) || '');

			const response = await apiFetch({
				url: (typeof ajaxurl !== 'undefined' && ajaxurl) || '/wp-admin/admin-ajax.php',
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

			setActivationText(__('Fetching token data...', 'wp-ai-blogger'));

			// Fetch token data after successful license activation
			try {
				const tokenResult = await fetchTokenData();
				if (!tokenResult?.success) {
					console.warn('Token fetch failed after activation, but license is still active');
				}
			} catch (tokenError) {
				console.error('Token fetch error after activation:', tokenError);
				// Don't fail license activation if token fetch fails
			}

			setActivationText(__('Activated', 'wp-ai-blogger'));
			setLicenseKey('');

			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __('License activated and token data loaded successfully!', 'wp-ai-blogger'),
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
	}, [licenseKey, processing, dispatch, fetchTokenData]);

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
			formData.append('wp_ai_blogger_licensing_nonce', (typeof wpaib_localized_data !== 'undefined' && wpaib_localized_data?.licensing_nonce) || '');

			const response = await apiFetch({
				url: (typeof ajaxurl !== 'undefined' && ajaxurl) || '/wp-admin/admin-ajax.php',
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
				dispatch({
					type: 'UPDATE_TOKEN_TOTAL',
					payload: 0,
				});
				dispatch({
					type: 'UPDATE_TOKEN_REMAINING',
					payload: 0,
				});

				// Also reset local token data
				setLocalTokenData({
					total: 0,
					remaining: 0,
					lastUpdated: new Date().toISOString()
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

	// Enhanced token refresh
	const refreshTokens = useCallback(async () => {
		if (licenseStatus !== 'licensed' || refreshing || !license || isTokenFetching) return;

		setRefreshing(true);

		try {
			const result = await fetchTokenData();

			// Check if token data was successfully fetched (even if backend save failed)
			if (result?.success) {
				dispatch({
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __('Token data refreshed successfully!', 'wp-ai-blogger'),
				});
			} else {
				throw new Error(__('Failed to fetch token data from server', 'wp-ai-blogger'));
			}
		} catch (error) {
			console.error('Token refresh error:', error);

			// Only show error if the external API call actually failed
			dispatch({
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: error.message || __('Failed to refresh token data', 'wp-ai-blogger'),
			});
		} finally {
			setRefreshing(false);
		}
	}, [licenseStatus, refreshing, license, isTokenFetching, fetchTokenData, dispatch]);

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
						{__('License & Token Management', 'wp-ai-blogger')}
					</h2>
					<p className="text-gray-600 text-sm">
						{__('Manage your license and monitor AI token usage', 'wp-ai-blogger')}
					</p>
				</div>
			</div>

			{/* License status overview */}
			<LicenseStatus
				status={licenseStatus}
				tokensUsed={tokensUsed}
				totalTokens={displayTokenTotal}
				onRefresh={refreshTokens}
				isRefreshing={refreshing}
			/>

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
					? __(`License is active with ${displayTokenRemaining} tokens remaining`, 'wp-ai-blogger')
					: __('No active license', 'wp-ai-blogger')
				}
			</div>
		</div>
	);
});

License.displayName = 'LicenseSettings';

export default License;
