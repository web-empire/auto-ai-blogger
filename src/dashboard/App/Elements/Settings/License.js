import { useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch, useSelector } from 'react-redux';
import SettingsContainer from '@Components/SettingsContainer';
import { updateApiData } from '@Utils/ApiData';
import SettingLabel from '@Components/SettingLabel';

export default function License() {
	const dispatch = useDispatch();

	const licenseStatus = useSelector( ( state ) => state.licenseStatus ) || 'unlicensed';
	const [ processing, setProcessing ] = useState( false );
	const [ licenseKey, setLicenseKey ] = useState( '' );
	const [ activationText, setActivationText ] = useState( __( 'Activate', 'wp-ai-blogger' ) );
	const [ deactivationText, setDeactivationText ] = useState( __( 'Deactivate', 'wp-ai-blogger' ) );
	const [ activated, setActivated ] = useState( 'licensed' === licenseStatus );
	const abortControllerRef = useRef( {} );

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
		formData.append( 'nonce', wpaib_localized_data.licensing_nonce );

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
		formData.append( 'nonce', wpaib_localized_data.licensing_nonce );

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
		} );
	};

	return (
		<SettingsContainer
			title={ __( 'License & Tokens', 'wp-ai-blogger' ) }
			description={ __( 'Boost your AI Blogger capabilities by activating your license.', 'wp-ai-blogger' ) }
			element={
				<div className="w-full">
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
				</div>
			}
		/>
	);
}
