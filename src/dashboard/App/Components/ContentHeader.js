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
	sexually_explicit,
	dangerous_content,
	civic_integrity,
} ) => {
	const abortControllerRef = useRef( {} );
	const dispatch = useDispatch();
	const [ processing, setProcessing ] = useState( false );

	if ( 'license' === tab ) {
		return null; // Return null for license tab, avoid unnecessary processing
	}

	const saveSettings = async () => {
		setProcessing( true );
		console.log( __( 'Settings saved', 'wp-ai-blogger' ) );

		const settingsToSave = {
			siteTitle,
			siteFor,
			siteDescription,
			temperature,
			harassment,
			hate,
			sexually_explicit,
			dangerous_content,
			civic_integrity,
		};

		const validSettings = Object.entries( settingsToSave )
			.filter( ( [ key, value ] ) => value !== undefined && value !== null && ( typeof value !== 'string' || value !== '' ) ) // eslint-disable-line
			.reduce( ( acc, [ key, value ] ) => ( { ...acc, [ key ]: value } ), {} );

		await Promise.all(
			Object.entries( validSettings )
				.map( async ( [ key, value ] ) => await updateApiData( key, value, dispatch, abortControllerRef ) )
		);

		dispatch( {
			type: 'UPDATE_SETTINGS_SAVED_NOTIFICATION',
			payload: __( 'Settings saved', 'wp-ai-blogger' ),
		} );

		setProcessing( false );
	};

	return (
		<div className="flex items-center justify-between pb-4 mb-8 wpaib-content-header">
			<h1 className="text-lg font-semibold text-gray-900 p-0 m-0">
				{ title + __( ' Settings', 'wp-ai-blogger' ) }
			</h1>
			<button
				type="submit"
				disabled={ processing }
				onClick={ saveSettings }
				className="cursor-pointer inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				{ __( 'Save', 'wp-ai-blogger' ) }
			</button>
		</div>
	);
};

export default ContentHeader;
