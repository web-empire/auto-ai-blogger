import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from 'react-redux';
import SettingsContainer from '@Components/SettingsContainer';
import { RefreshCw } from 'lucide-react';
import { Tooltip } from '@wordpress/components';

import SettingField from '@Components/SettingField';
import SettingLabel from '@Components/SettingLabel';

export default function License() {
	const dispatch = useDispatch();

	const [ licenseStatus, setLicenseStatus ] = useState( autoblog_data?.license_status );
	const [ processing, setProcessing ] = useState( false );
	const [ licenseKey, setLicenseKey ] = useState( '' );
	const [ activationText, setActivationText ] = useState( __( 'Activate', 'wp-ai-blogger' ) );
	const [ deactivationText, setDeactivationText ] = useState( __( 'Deactivate', 'wp-ai-blogger' ) );
	const [ activated, setActivated ] = useState( 'licensed' === licenseStatus );

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
		formData.append( 'action', 'autoblog_ai_activate_license' );
		formData.append( 'license_key', licenseKey );
		formData.append( 'nonce', autoblog_data.licensing_nonce );

		apiFetch( {
			url: ajaxurl,
			method: 'POST',
			body: formData,
		} ).then( ( data ) => {
			if ( data.success ) {
				setActivated( true );
				setLicenseKey( '' );
				setLicenseStatus( 'licensed' );
				setActivationText( __( 'Activated', 'wp-ai-blogger' ) );

			} else {
				setActivationText( __( 'Activate', 'wp-ai-blogger' ) );
			}
			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: data?.data?.message,
			} );
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
		formData.append( 'action', 'autoblog_ai_deactivate_license' );
		formData.append( 'nonce', autoblog_data.licensing_nonce );

		apiFetch( {
			url: ajaxurl,
			method: 'POST',
			body: formData,
		} ).then( ( data ) => {
			if ( data.success ) {
				setActivated( false );
				setLicenseKey( '' );
				setLicenseStatus( 'unlicensed' );
				setDeactivationText( __( 'Deactivated', 'wp-ai-blogger' ) );
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
				<div className='grid grid-cols-2 gap-6 w-full'>
					<div>
						<SettingLabel forId='license-key' title={ __( 'License Key', 'wp-ai-blogger' ) } />
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
									className="cursor-pointer border-none rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
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
									className="cursor-pointer inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
								>
									{ activationText }
								</button>
							) }
						</div>
					</div>

					<SettingField>
						<SettingLabel forId='available-tokens' title={ __( 'Tokens Consumed', 'wp-ai-blogger' ) } />
						<div className='flex gap-2 flex-row items-center mt-3'>
							<p className='text-sm text-gray-500 m-0 p-0'> { __( '5,600 of 1,00,000 Tokens Used', 'wp-ai-blogger' ) } </p>
							<a
								href="#"
								className="text-gray-500 hover:text-indigo-900 flex items-center"
								onClick={ () => {
									// Refresh the tokens consumed.
								} }
							>
								<Tooltip text={ __( 'Refresh', 'wp-ai-blogger' ) } delay={ 100 } className="z-999999 bg-black text-xs text-white shadow-md p-2 rounded-md">
									<RefreshCw className="w-4 h-4" />
								</Tooltip>
							</a>
						</div>
					</SettingField>
				</div>
			}
		/>
	);
}
