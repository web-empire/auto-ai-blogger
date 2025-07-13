import { useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch, useSelector } from 'react-redux';
import SettingsContainer from '@Components/SettingsContainer';
import { RefreshCw } from 'lucide-react';
import { Tooltip } from '@wordpress/components';
import { updateApiData } from '@Utils/ApiData';

import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';

export default function License() {
	const dispatch = useDispatch();

	const licenseStatus = useSelector( ( state ) => state.licenseStatus ) || 'unlicensed';
	const [ processing, setProcessing ] = useState( false );
	const [ licenseKey, setLicenseKey ] = useState( '' );
	const [ activationText, setActivationText ] = useState( __( 'Activate', 'wp-ai-blogger' ) );
	const [ deactivationText, setDeactivationText ] = useState( __( 'Deactivate', 'wp-ai-blogger' ) );
	const [ activated, setActivated ] = useState( 'licensed' === licenseStatus );
	const tokenTotal = useSelector( ( state ) => state.tokenTotal ) || 0;
	const tokenRemaining = useSelector( ( state ) => state.tokenRemaining ) || 0;
	const license = useSelector( ( state ) => state.license ) || '';
	const abortControllerRef = useRef( {} );

	// Calculate tokens used and format numbers
	const tokensUsed = activated ? tokenTotal - tokenRemaining : 0;
	const totalTokens = activated ? tokenTotal : 0;
	const formattedTokensUsed = tokensUsed.toLocaleString();
	const formattedTotalTokens = totalTokens.toLocaleString();

	/**
	 * Activate the license.
	 */
	const activateLicense = () => {
		if ( ! licenseKey.trim() ) {
			return;
		}

		if ( processing ) {
			return;
		}

		setActivationText( __( 'Activating', 'wp-ai-blogger' ) );
		setProcessing( true );

		const formData = new window.FormData();
		formData.append( 'action', 'wp_ai_blogger_activate_license' );
		formData.append( 'license_key', licenseKey );
		formData.append( 'nonce', autoblog_data.licensing_nonce );

		apiFetch( {
			url: ajaxurl,
			method: 'POST',
			body: formData,
		} ).then( ( data ) => {
			if ( data.success ) {
				// First update the license status
				setActivated( true );
				// Update license status.
				dispatch( {
					type: 'UPDATE_LICENSE_STATUS',
					payload: 'licensed',
				} );
				setActivationText( __( 'Fetching tokens…', 'wp-ai-blogger' ) );
				setDeactivationText( __( 'Activating', 'wp-ai-blogger' ) );

				// Then fetch the token data using native fetch (not apiFetch for external APIs)
				return fetch( `https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data?license=${ licenseKey }`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				} ).then( ( response ) => {
					if ( ! response.ok ) {
						throw new Error( `HTTP error! status: ${ response.status }` );
					}
					return response.json();
				} );
			}
			setActivationText( __( 'Activate', 'wp-ai-blogger' ) );
			throw new Error( data?.data?.message || 'License activation failed' );
		} ).then( async ( tokenData ) => {
			if ( tokenData && tokenData.success && tokenData.data ) {
				console.log( 'TOKEN TOTAL:', tokenData.data.total );
				console.log( 'TOKEN REMAINING:', tokenData.data.remaining );

				// Update the store with token data
				dispatch( {
					type: 'UPDATE_TOKEN_TOTAL',
					payload: tokenData.data.total,
				} );

				// Update the store with token data
				dispatch( {
					type: 'UPDATE_TOKEN_REMAINING',
					payload: tokenData.data.remaining,
				} );

				// Update API data similar to post ideas pattern
				await updateApiData( 'tokenTotal', tokenData.data.total, dispatch, abortControllerRef );
				await updateApiData( 'tokenRemaining', tokenData.data.remaining, dispatch, abortControllerRef );

				// Handle successful token fetch
				setActivationText( __( 'Activated', 'wp-ai-blogger' ) );
				setDeactivationText( __( 'Deactivate', 'wp-ai-blogger' ) );
				setLicenseKey( '' );

				dispatch( {
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __( 'License activated and tokens fetched successfully!', 'wp-ai-blogger' ),
				} );
			} else {
				console.error( 'API Error: Invalid response from token API' );
				throw new Error( 'Invalid response from token API.' );
			}
		} ).catch( ( error ) => {
			// Handle any errors from either the license activation or token fetch
			console.error( 'License activation error:', error );

			setActivationText( __( 'Activate', 'wp-ai-blogger' ) );
			setActivated( false );
			// Update license status.
			dispatch( {
				type: 'UPDATE_LICENSE_STATUS',
				payload: 'unlicensed',
			} );

			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __( 'Failed to activate license or fetch tokens', 'wp-ai-blogger' ),
			} );
		} ).finally( () => {
			setProcessing( false );
			setTimeout( () => {
				location.reload();
			}, 500 );
		} );
	};

	/**
	 * Deactivate the license.
	 */
	const deactivateLicense = () => {
		if ( processing ) {
			return;
		}

		setDeactivationText( __( 'Deactivating', 'wp-ai-blogger' ) );
		setProcessing( true );

		const formData = new window.FormData();
		formData.append( 'action', 'wp_ai_blogger_deactivate_license' );
		formData.append( 'nonce', autoblog_data.licensing_nonce );

		apiFetch( {
			url: ajaxurl,
			method: 'POST',
			body: formData,
		} ).then( ( data ) => {
			if ( data.success ) {
				setActivated( false );
				setLicenseKey( '' );
				// Update license status.
				dispatch( {
					type: 'UPDATE_LICENSE_STATUS',
					payload: 'unlicensed',
				} );
				setDeactivationText( __( 'Deactivated', 'wp-ai-blogger' ) );
				setActivationText( __( 'Activate', 'wp-ai-blogger' ) );

				// Clear token data when deactivating
				dispatch( {
					type: 'UPDATE_TOKEN_TOTAL',
					payload: 0,
				} );
				dispatch( {
					type: 'UPDATE_TOKEN_REMAINING',
					payload: 0,
				} );
			} else {
				setDeactivationText( __( 'Deactivate', 'wp-ai-blogger' ) );
			}
			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: data?.data?.message,
			} );
			setProcessing( false );
			setTimeout( () => {
				location.reload();
			}, 500 );
		} );
	};

	/**
	 * Refresh token data.
	 */
	const refreshTokens = () => {
		if ( licenseStatus !== 'licensed' || processing || ! license ) {
			return;
		}

		setProcessing( true );

		// Fetch fresh token data using the license key from Redux store
		fetch( `https://wpaiblogger.com/wp-json/wp-ai-blogger/v1/get-token-data?license=${ license }`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		} ).then( ( response ) => {
			if ( ! response.ok ) {
				throw new Error( `HTTP error! status: ${ response.status }` );
			}
			return response.json();
		} ).then( async ( tokenData ) => {
			if ( tokenData && tokenData.success && tokenData.data ) {
				// Update the store with fresh token data
				dispatch( {
					type: 'UPDATE_TOKEN_TOTAL',
					payload: tokenData.data.total,
				} );
				dispatch( {
					type: 'UPDATE_TOKEN_REMAINING',
					payload: tokenData.data.remaining,
				} );

				// Update API data
				await updateApiData( 'tokenTotal', tokenData.data.total, dispatch, abortControllerRef );
				await updateApiData( 'tokenRemaining', tokenData.data.remaining, dispatch, abortControllerRef );

				dispatch( {
					type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
					payload: __( 'Token data refreshed successfully!', 'wp-ai-blogger' ),
				} );
			} else {
				throw new Error( 'Invalid response from token API.' );
			}
		} ).catch( ( error ) => {
			console.error( 'Token refresh error:', error );
			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __( 'Failed to refresh token data', 'wp-ai-blogger' ),
			} );
		} ).finally( () => {
			setProcessing( false );
		} );
	};

	return (
		<SettingsContainer
			title={ __( 'License & Tokens', 'wp-ai-blogger' ) }
			description={ __( 'Boost your AI Blogger capabilities by activating your license.', 'wp-ai-blogger' ) }
			element={
				<div className="grid grid-cols-2 gap-6 w-full">
					<div>
						<SettingLabel forId="license-key" title={ __( 'License Key', 'wp-ai-blogger' ) } />
						<div className="mt-2 flex gap-4">
							<input
								id="license-key"
								name="license-key"
								placeholder={ 'licensed' === licenseStatus ? __( 'Your license is activated', 'wp-ai-blogger' ) : __( 'Paste your license key here', 'wp-ai-blogger' ) }
								value={ licenseKey }
								disabled={ activated }
								onChange={ ( event ) => {
									setLicenseKey( ( event.target.value ).trim() );
								} }
								type="text"
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
							/>

							{ activated ? (
								<button
									type="button"
									onClick={ () => {
										deactivateLicense();
									} }
									className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
								>
									{ deactivationText }
								</button>
							) : (
								<button
									type="submit"
									disabled={ '' === licenseKey }
									onClick={ () => {
										activateLicense();
									} }
									className="cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
								>
									{ activationText }
								</button>
							) }
						</div>
					</div>

					<SettingField>
						<SettingLabel forId="available-tokens" title={ __( 'Tokens Consumed', 'wp-ai-blogger' ) } />
						<div className="flex gap-2 flex-row items-center mt-3">
							<p className="text-sm text-gray-500 m-0 p-0">
								{ formattedTokensUsed }
								{ ' ' }
								{ __( 'of', 'wp-ai-blogger' ) }
								{ ' ' }
								{ formattedTotalTokens }
								{ ' ' }
								{ __( 'Tokens Used', 'wp-ai-blogger' ) }
							</p>
							<button
								disabled={ licenseStatus !== 'licensed' || processing || ! license }
								className={ `
									text-indigo-700 hover:text-indigo-900
									bg-indigo-50 hover:bg-indigo-100
									border border-indigo-200 hover:border-indigo-300
									rounded-md px-2 py-1
									flex items-center justify-center
									font-medium
									transition-all duration-200
									focus:outline-none focus:ring-0
									${ licenseStatus !== 'licensed' || processing || ! license ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm' }
								` }
								onClick={ refreshTokens }
							>
								<Tooltip text={ __( 'Refresh', 'wp-ai-blogger' ) } delay={ 100 } className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md">
									<RefreshCw className={ `w-4 h-4 ${ processing ? 'animate-spin' : '' }` } />
								</Tooltip>
							</button>
						</div>
					</SettingField>
				</div>
			}
		/>
	);
}
