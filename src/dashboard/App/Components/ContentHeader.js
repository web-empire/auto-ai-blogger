import { __ } from '@wordpress/i18n';
import { useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { updateApiData } from '@Utils/ApiData';

/**
 * Enhanced ContentHeader component with improved error handling and UX
 */
const ContentHeader = ( {
	title = '',
	tab = '',
	siteTitle = '',
	siteFor = '',
	siteDescription = '',
	temperature = 0.7,
	harassment = false,
	hate = false,
	sexuallyExplicit = false,
	dangerousContent = false,
	className = '',
	onSaveStart,
	onSaveComplete,
	onSaveError,
	...otherProps
} ) => {
	// Don't render for license tab - check this FIRST before any other processing
	if ( tab === 'license' ) {
		return null;
	}

	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();
	const [ processing, setProcessing ] = useState( false );
	const [ lastSaveTime, setLastSaveTime ] = useState( null );

	// Memoize settings object to prevent unnecessary re-renders
	const settingsToSave = useMemo( () => {
		const settings = {
			siteTitle,
			siteFor,
			siteDescription,
			temperature,
			harassment,
			hate,
			sexuallyExplicit,
			dangerousContent,
		};

		// Filter out undefined and null values
		return Object.entries( settings )
			.filter( ( [ , value ] ) => value !== undefined && value !== null )
			.reduce( ( acc, [ key, value ] ) => ( { ...acc, [ key ]: value } ), {} );
	}, [
		siteTitle,
		siteFor,
		siteDescription,
		temperature,
		harassment,
		hate,
		sexuallyExplicit,
		dangerousContent
	] );

	// Enhanced save function with better error handling
	const saveSettings = useCallback( async () => {
		// Prevent multiple simultaneous saves
		if ( processing ) {
			return;
		}

		try {
			setProcessing( true );
			onSaveStart?.();

			// Validate settings before saving
			if ( Object.keys( settingsToSave ).length === 0 ) {
				throw new Error( __( 'No settings to save', 'wp-ai-blogger' ) );
			}

			// Save settings with proper error propagation
			const savePromises = Object.entries( settingsToSave ).map( async ( [ key, value ] ) => {
				console.log( `Saving setting: ${ key }`, value );
				return updateApiData( key, value, dispatch, abortControllerRef );
			} );

			await Promise.all( savePromises );

			// Success feedback
			const successMessage = __( 'Settings saved successfully', 'wp-ai-blogger' );

			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: {
					message: successMessage,
					type: 'success',
					duration: 3000,
				},
			} );

			setLastSaveTime( new Date() );
			onSaveComplete?.( settingsToSave );

		} catch ( error ) {
			console.error( 'Failed to save settings:', error );

			const errorMessage = error?.message || __( 'Failed to save settings. Please try again.', 'wp-ai-blogger' );

			dispatch( {
				type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
				payload: {
					message: errorMessage,
					type: 'error',
					duration: 5000,
				},
			} );

			onSaveError?.( error );
		} finally {
			setProcessing( false );
		}
	}, [ processing, settingsToSave, dispatch, onSaveStart, onSaveComplete, onSaveError ] );

	// Memoize header title
	const headerTitle = useMemo( () => {
		if ( ! title ) return __( 'Settings', 'wp-ai-blogger' );
		return `${ title } ${ __( 'Settings', 'wp-ai-blogger' ) }`;
	}, [ title ] );

	// Format last save time
	const formatLastSave = useCallback( () => {
		if ( ! lastSaveTime ) return null;

		const now = new Date();
		const diffMinutes = Math.floor( ( now - lastSaveTime ) / ( 1000 * 60 ) );

		if ( diffMinutes < 1 ) {
			return __( 'Saved just now', 'wp-ai-blogger' );
		} else if ( diffMinutes < 60 ) {
			return __( `Saved ${ diffMinutes } minute${ diffMinutes === 1 ? '' : 's' } ago`, 'wp-ai-blogger' );
		} else {
			return lastSaveTime.toLocaleTimeString();
		}
	}, [ lastSaveTime ] );

	return (
		<div className={ `flex items-center justify-between pb-4 mb-8 wpaib-content-header ${ className }` }>
			<div className="flex-1">
				<h1 className="text-lg font-semibold text-gray-900 p-0 m-0">
					{ headerTitle }
				</h1>
				{ lastSaveTime && (
					<p className="text-sm text-slate-500 mt-1">
						{ formatLastSave() }
					</p>
				) }
			</div>

			<button
				type="button"
				disabled={ processing || Object.keys( settingsToSave ).length === 0 }
				onClick={ saveSettings }
				className="cursor-pointer inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
				aria-label={ processing ? __( 'Saving settings...', 'wp-ai-blogger' ) : __( 'Save settings', 'wp-ai-blogger' ) }
				aria-describedby={ lastSaveTime ? 'last-save-time' : undefined }
			>
				{ processing ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						<span>{ __( 'Saving…', 'wp-ai-blogger' ) }</span>
					</>
				) : (
					<>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={ 2 }
								d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
							/>
						</svg>
						<span>{ __( 'Save Settings', 'wp-ai-blogger' ) }</span>
					</>
				) }
			</button>
		</div>
	);
};

export default ContentHeader;
