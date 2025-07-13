import { __ } from '@wordpress/i18n';
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';

const ContentHeader = ( {
	title,
	tab,
	siteTitle,
	siteFor,
	siteDescription,
	temperature,
	harassment,
	hate,
	sexuallyExplicit,
	dangerousContent,
} ) => {
	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();
	const [ processing, setProcessing ] = useState( false );

	if ( 'license' === tab ) {
		return null; // Return null for license tab, avoid unnecessary processing
	}

	const saveSettings = async () => {
		setProcessing( true );

		const settingsToSave = {
			siteTitle,
			siteFor,
			siteDescription,
			temperature,
			harassment,
			hate,
			sexuallyExplicit,
			dangerousContent,
		};

		const validSettings = Object.entries( settingsToSave )
			.filter( ( [ key, value ] ) => value !== undefined && value !== null ) // eslint-disable-line no-unused-vars
			.reduce( ( acc, [ key, value ] ) => ( { ...acc, [ key ]: value } ), {} );

		try {
			await Promise.all(
				Object.entries( validSettings )
					.map( async ( [ key, value ] ) => {
						console.log( `Attempting to save: ${ key } with value:`, value );
						// updateApiData will now propagate errors
						return await updateApiData( key, value, dispatch, abortControllerRef );
					} )
			);

			console.log( __( 'Settings saved', 'wp-ai-blogger' ) );

			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __( 'Settings saved', 'wp-ai-blogger' ),
			} );
		} catch ( error ) {
			// This catch block will now correctly execute if any updateApiData call fails
			console.error( 'Failed to save settings:', error );
			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: __( 'Error saving settings. Please check console for details.', 'wp-ai-blogger' ),
			} );
		} finally {
			setProcessing( false );
		}
	};

	return (
		<div className="flex items-center justify-between pb-4 mb-8 wpaib-content-header">
			<h1 className="text-lg font-semibold text-gray-900 p-0 m-0">
				{ title + __( ' Settings', 'wp-ai-blogger' ) }
			</h1>
			<button
				type="submit"
				disabled={ processing } // Disable button when processing
				onClick={ saveSettings }
				// Apply a flexible display (flex) to align icon and text
				className="cursor-pointer inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				{ processing ? (
					<>
						{ /* SVG Spinner */ }
						<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						{ __( 'Saving…', 'wp-ai-blogger' ) }
					</>
				) : (
				// Default Save text
					__( 'Save', 'wp-ai-blogger' )
				) }
			</button>
		</div>
	);
};

export default ContentHeader;
