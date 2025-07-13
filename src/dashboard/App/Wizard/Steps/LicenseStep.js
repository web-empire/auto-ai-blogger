import React, { useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateApiData } from '@Utils/ApiData';
import apiFetch from '@wordpress/api-fetch';

const LicenseStep = () => {
	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Fetch data from Redux.
	const reduxLicense = useSelector( ( state ) => state.license );
	const [ licenseStatus, setLicenseStatus ] = useState( autoblog_data?.license_status );
	const [ processing, setProcessing ] = useState( false );
	const [ buttonText, setButtonText ] = useState( __( 'Connect & Proceed', 'wp-ai-blogger' ) );

	// Use Redux data for initial state.
	const [ license, setLicense ] = useState( reduxLicense || autoblog_data.license );

	const [ licenseStatusMessage, setLicenseStatusMessage ] = useState( '' );

	/**
	 * Activate the license.
	 */
	const activateLicense = async () => {
		if ( ! license.trim() ) {
			return;
		}

		if ( processing ) {
			return;
		}

		setButtonText( __( 'Activating', 'wp-ai-blogger' ) );
		setProcessing( true );

		const formData = new window.FormData();
		formData.append( 'action', 'wp_ai_blogger_activate_license' );
		formData.append( 'license_key', license );
		formData.append( 'nonce', autoblog_data.licensing_nonce );

		apiFetch( {
			url: ajaxurl,
			method: 'POST',
			body: formData,
		} ).then( ( data ) => {
			if ( data.success ) {
				setLicense( '' );
				setLicenseStatus( 'licensed' );
				setButtonText( __( 'Proceeding...', 'wp-ai-blogger' ) );
				setLicenseStatusMessage( __( 'License activated successfully.', 'wp-ai-blogger' ) );
				navigate( `${ autoblog_data.admin_app_url }&step=optin` );
			} else {
				setButtonText( __( 'Connect & Proceed', 'wp-ai-blogger' ) );
			}
			setProcessing( false );
		} );
	};

	const handleStepRedirection = async function () {
		// Reset errors.
		setLicenseStatusMessage( '' );

		let hasError = false;

		if ( ! license ) {
			setLicenseStatusMessage( __( 'License is required.', 'wp-ai-blogger' ) );
			hasError = true;
		}

		if ( hasError ) {
			return; // Stop redirection if there are errors.
		}

		await activateLicense();
		if ( 'licensed' !== licenseStatus ) {
			setLicenseStatusMessage( __( 'License activation failed. Please check your license key.', 'wp-ai-blogger' ) );
			return;
		}

		// Update data
		await updateApiData( 'license', license, dispatch, abortControllerRef );
		dispatch( { type: 'UPDATE_LICENSE', payload: license } );

		navigate( `${ autoblog_data.admin_app_url }&step=optin` );
	};

	return (
		<div className="wpaib-container">
			<div className="wpaib-row mt-8 max-w-5xl">
				<div className="bg-white rounded text-center mx-auto px-11">
					<span className="text-sm font-medium text-primary-600 mb-10 text-center block tracking-[.24em] uppercase">
						{ __( 'Step 3 of 4', 'wp-ai-blogger' ) }
					</span>

					<h1 className="wpaib-step-heading mb-2 text-center">
						{ __( 'Connect Your Site', 'wp-ai-blogger' ) }
					</h1>

					<p className="text-center overflow-hidden font-normal text-[#4B5563] text-base">
						{ __( 'Enter your license key below to allocate tokens for WP AI Blogger from', 'wp-ai-blogger' ) }
						{ ' ' }
						<a href={autoblog_data.upgrade_link} target='_blank' className="text-blue-500">{ __('here', 'wp-ai-blogger') }</a>.
					</p>

					<form className="max-w-sm mx-auto mt-10">
						<div className="sm:flex flex-col gap-2 text-left">
							<div className="w-full">
								<label htmlFor="wpaib-license" className="text-slate-800 text-base font-semibold block">
									{ __( 'License Key', 'wp-ai-blogger' ) }
								</label>
								<input
									id="wpaib-license"
									type="text"
									className="!my-2 !p-3 !shadow-sm block w-full !text-sm !border-gray-300 !rounded !text-gray-500 !placeholder-slate-400 focus:ring focus:!shadow-none"
									value={ license }
									onChange={ ( e ) => setLicense( e.target.value ) }
								/>
								{ licenseStatusMessage && <p className="text-red-500 mt-1">{ licenseStatusMessage }</p> }
							</div>

							<p className="wpaib-step-text text-center overflow-hidden text-sm font-normal text-slate-500">
								{ __( 'Don\'t have a license key?', 'wp-ai-blogger' ) }
								{ ' ' }
								<a href={autoblog_data.upgrade_link} target='_blank' className="text-blue-500">{ __('Get Free Credits', 'wp-ai-blogger') }</a>
							</p>
						</div>

						<div className="mt-[40px] grid justify-center">
							<button
								className="wpaib-wizard--button"
								disabled={ ! license || processing } onClick={ handleStepRedirection }
							>
								{ buttonText }
								<ArrowRight className="w-5 h-5" />
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LicenseStep;
