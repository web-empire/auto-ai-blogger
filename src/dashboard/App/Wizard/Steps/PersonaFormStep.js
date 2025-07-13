import React, { useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateApiData } from '@Utils/ApiData';

const PersonaFormStep = () => {
	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Fetch data from Redux
	const reduxSiteTitle = useSelector( ( state ) => state.siteTitle );
	const reduxSiteFor = useSelector( ( state ) => state.siteFor );
	const reduxSiteDescription = useSelector( ( state ) => state.siteDescription );

	// Use Redux data for initial state
	const [ siteTitle, setSiteTitle ] = useState( reduxSiteTitle || autoblog_data.site_title );
	const [ siteFor, setSiteFor ] = useState( reduxSiteFor || autoblog_data.site_for );
	const [ siteDescription, setSiteDescription ] = useState( reduxSiteDescription || autoblog_data.site_description );

	const [ siteTitleError, setSiteTitleError ] = useState( '' );
	const [ siteForError, setSiteForError ] = useState( '' );
	const [ siteDescriptionError, setSiteDescriptionError ] = useState( '' );

	const handleStepRedirection = async function ( e ) {
		e.preventDefault();

		// Reset errors
		setSiteTitleError( '' );
		setSiteForError( '' );
		setSiteDescriptionError( '' );

		let hasError = false;

		if ( ! siteTitle ) {
			setSiteTitleError( __( 'Site Title is required.', 'wp-ai-blogger' ) );
			hasError = true;
		}

		if ( ! siteFor ) {
			setSiteForError( __( 'Site For is required.', 'wp-ai-blogger' ) );
			hasError = true;
		}

		if ( ! siteDescription ) {
			setSiteDescriptionError( __( 'Site Description is required.', 'wp-ai-blogger' ) );
			hasError = true;
		}

		if ( hasError ) {
			return; // Stop redirection if there are errors
		}

		// Update data
		await updateApiData( 'siteTitle', siteTitle, dispatch, abortControllerRef );
		await updateApiData( 'siteFor', siteFor, dispatch, abortControllerRef );
		await updateApiData( 'siteDescription', siteDescription, dispatch, abortControllerRef );

		dispatch( { type: 'UPDATE_SITE_TITLE', payload: siteTitle } );
		dispatch( { type: 'UPDATE_SITE_FOR', payload: siteFor } );
		dispatch( { type: 'UPDATE_SITE_DESCRIPTION', payload: siteDescription } );

		navigate( `${ autoblog_data.admin_app_url }&step=license` );
	};

	return (
		<div className="wpaib-container">
			<div className="wpaib-row mt-8 max-w-5xl">
				<div className="bg-white rounded text-center mx-auto px-11">
					<span className="text-sm font-medium text-primary-600 mb-10 text-center block tracking-[.24em] uppercase">
						{ __( 'Step 2 of 4', 'wp-ai-blogger' ) }
					</span>

					<h1 className="wpaib-step-heading mb-2 text-center">
						{ __( 'Tell Us About Your Site', 'wp-ai-blogger' ) }
					</h1>

					<form className="max-w-sm mx-auto mt-10">
						<div className="sm:flex flex-col gap-5 text-left">
							<div className="w-full">
								<label htmlFor="wpaib-site-title" className="text-slate-800 text-base font-semibold block">
									{ __( 'Site Title', 'wp-ai-blogger' ) }
								</label>
								<input
									id="wpaib-site-title"
									type="text"
									className="!my-2 !p-3 !shadow-sm block w-full !text-sm !border-gray-300 !rounded !text-gray-500 !placeholder-slate-400 focus:ring focus:!shadow-none"
									value={ siteTitle }
									onChange={ ( e ) => setSiteTitle( e.target.value ) }
								/>
								{ siteTitleError && <p className="text-red-500 mt-1">{ siteTitleError }</p> }
							</div>
							<div className="w-full">
								<label htmlFor="wpaib-site-for" className="text-slate-800 text-base font-semibold block">
									{ __( 'Site For', 'wp-ai-blogger' ) }
								</label>
								<input
									id="wpaib-site-for"
									type="text"
									className="!my-2 !p-3 !shadow-sm block w-full !text-sm !border-gray-300 !rounded !text-gray-500 !placeholder-slate-400 focus:ring focus:!shadow-none"
									value={ siteFor }
									onChange={ ( e ) => setSiteFor( e.target.value ) }
								/>
								{ siteForError && <p className="text-red-500 mt-1">{ siteForError }</p> }
							</div>
							<div className="w-full">
								<label htmlFor="wpaib-site-description" className="text-slate-800 text-base font-semibold block">
									{ __( 'Site Description', 'wp-ai-blogger' ) }
								</label>
								<textarea
									id="wpaib-site-description"
									className="!my-2 !p-3 !shadow-sm block w-full !text-sm !border-gray-300 !rounded !text-gray-500 !placeholder-slate-400 focus:ring focus:!shadow-none"
									value={ siteDescription }
									onChange={ ( e ) => setSiteDescription( e.target.value ) }
								/>
								{ siteDescriptionError && <p className="text-red-500 mt-1">{ siteDescriptionError }</p> }
							</div>
						</div>

						<div className="mt-[40px] grid justify-center">
							<button className="wpaib-wizard--button" onClick={ handleStepRedirection }>
								{ __( 'Next', 'wp-ai-blogger' ) }
								<ArrowRight className="w-5 h-5" />
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default PersonaFormStep;
